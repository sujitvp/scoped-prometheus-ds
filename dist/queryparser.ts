export default class ScopedPrometheusQueryParser {
  
  private pOperators: RegExp = /count|count_values|min|max|avg|sum|stddev|stdvar|bottomk|topk|quantile/i;
  private pConstants: RegExp = /true|false|null|__name__|job/i;
  private pFunctions: RegExp = /abs|absent|ceil|changes|clamp_max|clamp_min|count_scalar|day_of_month|day_of_week|days_in_month|delta|deriv|drop_common_labels|exp|floor|histogram_quantile|holt_winters|hour|idelta|increase|irate|label_replace|ln|log2|log10|minute|month|predict_linear|rate|resets|round|scalar|sort|sort_desc|sqrt|time|vector|year|avg_over_time|min_over_time|max_over_time|sum_over_time|count_over_time|quantile_over_time|stddev_over_time|stdvar_over_time/;
  private pKeywords: RegExp = /by|without|ignoring|on|group_left|group_right/i;
  private pCOps: RegExp = /\s*(?:==|!=|>|<|>=|<=)(?:\s+bool\s+)?\s*/gi;
  private pMOps: RegExp = /\s*\+|-|\*|\/|%|\^\s*/g;
  private pBOps: RegExp = /(?:[})\s\]](?:and|or|unless)[\s{(])/gi;
  private pOps: RegExp = new RegExp(this.pCOps.source + "|" + this.pMOps.source + "|" + this.pBOps.source, "ig");
  private parenre: RegExp = /(\{[^}]+\}(?:\[\d+[hmsdw]\])?)/gi;
  private pConst: RegExp = /^\s*(?:(?:-?(?:(?:\d*\.\d+)|\d+)%?)|true|false|null|__##[0-9a-z]{6}##__)\s*$/i;
  private pString: RegExp = /"[^"]*"/g;
  
  private pq: any = {};
  private txttbl: any = {};

  private re: Array<any>[]=[
//    ["must", this.pString, this.saveText.bind(this), "post", ""],
    ["must", /^([^({]*)\{([^}]+)\}(\[\d+[hmsdw]\])?(\s+offset\s+\d+[hmsdw])?$/i, "$1{$$SCOPE,$2}$3$4", "preops", "may"],
    ["must", /^([^({\[]*)(\[\d+[hmsdw]\])?(\s+offset\s+\d+[hmsdw])$/i, "$1{$$SCOPE}$2$3", "preops", "may"],
    ["must", /^([^({\[]*)(\[\d+[hmsdw]\])?(?!\s+offset\s+\d+[hmsdw])$/i, "$1{$$SCOPE}$2", "preops", "may"],
    ["preops", this.pCOps, "$&", "ops", "preops"],
    ["preops", this.pMOps, "$&", "ops", "preops"],
    ["preops", this.pBOps, "$&", "ops", "preops"],
    ["may", /([^({]*)\{([^}]+)\}/g, "$1{$$SCOPE,$2}", "dedup", ""],
    ["may", /([^\s({]*)\s*\(([^()]+)\)/g, this.parseFunctions.bind(this), "dedup", ""],
    ["may", /^([^(]+((?:(?:==|!=|>|<|>=|<=)(?:\s+bool\s+)?)|(?:\+|-|\*|\/|%|\^)|(?:(?:[})\]\s](?:and|or|unless)[{(\s])))[^)(]+)+/, "$&", "ops", "may"],
    ["may", /([^(]+((?:(?:==|!=|>|<|>=|<=)(?:\s+bool\s+)?)|(?:\+|-|\*|\/|%|\^)|(?:(?:[})\]\s](?:and|or|unless)[{(\s])))[^)(]+)+$/, "$&", "ops", "may"],
    ["ops", /(.+((?:(?:==|!=|>|<|>=|<=)(?:\s+bool\s+)?)|(?:\+|-|\*|\/|%|\^)|(?:(?:[})\]\s](?:and|or|unless)[{(\s]))).+)+/, this.processOps.bind(this), "dedup", ""],
    ["dedup", /((?:\$SCOPE,)+)/g, "$$SCOPE,", "", ""],
    ["dedup", /(?:\$SCOPE,\$SCOPE)([^,])/g, "$$SCOPE$1", "", ""],
//    ["post", /__##[0-9a-z]{6}##__/g, this.retrieveText.bind(this), ""],
  ];

  constructor(){
    console.debug("New instance of datasource constructed...");
  }

  public injectScopeIntoQuery = (query: string, scope: string): string =>{
    console.time("injectScope Timer");
    var q = query.replace(this.pString,"\"__$$#$$TRING$$#$$__\"");
    console.debug("cached query count: %d;; using q= %s", Object.keys(this.pq).length, q);    
    //console.log(i + ">> Inside injectScopeIntoQuery. with query=%s;;", query );
    if (!this.pq.hasOwnProperty(q)) {
      this.pq[q] = this.parseQuery(q, "0");
      console.debug("Adding to query cache [%s;;] => [%s;;]", q, this.pq[q]);
    }
    var o = new Optimizer(query, this.pString);
    var ret = this.pq[q].replace(this.pString, o.swap.bind(o)).replace(/\$SCOPE/, scope);
    console.timeEnd("injectScope Timer");
    return ret;
  }

  private saveText(s: string): string {
    if (!this.txttbl) this.txttbl={};
    while (true) {
      var uid = "__##" + ("0000" + ((((new Date()).getTime() * Math.pow(36, 4)) | 0) * 10).toString(36)).slice(-6) + "##__";
      if (!this.txttbl.hasOwnProperty(uid)) {
         this.txttbl[uid] = s;
        return uid;
      }
    }
  }

  private retrieveText (s: string): string {
    console.assert(this.txttbl.hasOwnProperty(s));
    if (this.txttbl.hasOwnProperty(s)) {
      var ret = this.txttbl[s];
      delete this.txttbl[s];
      return ret;
    }
  }

  private parseFunctions () {
    //console.log(">> inside parseFunctions");
    for (var x = 0; x < arguments.length; x++) {
      //console.log(">> parseFunctions[" + x + "]=" + arguments[x]);
    }
    if (arguments[1] !== "") {
      // does not start with a bracket
      if (this.pKeywords.test(arguments[1])) {
        // if keywords, then the internal content is not a query
        return arguments[0];
      } else if (this.pOperators.test(arguments[1]) || this.pFunctions.test(arguments[1])) {
        // if functions or operators, then the internal content is possibly a query or more cascaded functions/ops
        return arguments[1] + "(" + this.parseSegment(arguments[2], "--") + ")";
      }
    } else {
      //starts with a bracket, so process as if this was a query
      return "(" + this.parseSegment(arguments[2], "--") + ")";
    }
  };

  private parseQuery(q: string, i?: string) : string {
    var stack = {};
    stack["must"]=1;
    stack["may"]=1;

    for (var k = 0; k < this.re.length; k++) {
      if (stack.hasOwnProperty(this.re[k][0])) {
        var m;
        if ((m = (this.re[k][1] as RegExp).exec(q)) !== null) {
          for (var j = 0; j < m.length; j++) {
            //console.log(i + " [" + k + "] => [" + j + "]" + m[j]);
          }
          q = q.replace(this.re[k][1], this.re[k][2]);
          if (this.re[k][3]) stack[this.re[k][3]] = 1;
          if (this.re[k][4]) delete stack[this.re[k][4]];
          //console.log(i + " : " + q);
        } else {
          //console.log(i + " [" + k + "] => null");
        }
      }
    }
    return q;
  };

  private parseSegment (a, b) {
    //console.log(b + ">> inside parseSegment: " + a);
    b = b + "-";
    //first test to see if the query has binary operators
    if (this.pOps.test(a)) {
      // at this point there is a possibility of binary operators with multiple series or binary operators within a series
      // if the latter, they will definitely be inside a {}
      // so lets first chunk off any {}
      var d = a.match(this.parenre); //get content
      var e = (d !== null) ? d.length : -1;
      var g = a;
      var ab = "";
      //console.log("%s b4 loop: d=%s;; d.length=%d;;", b, d, e);
      for (var i = 0; i < e; i++) {
        //console.log("%s top of loop: g = %s;;", b, g);
        //atleast one bracket-set was found -- will loop for each bracket set found
        var c = g.search(this.parenre); //get index of {}
        if (c > 0) {
          //process left side of brackets and the brackets
          //console.log("%s process left side: g.slice(0, %d)", b, c);
          ab = ab + this.processStuff(g.slice(0, c), b);
        }
        //process the bracket set
        //console.log("%s process bracket stuff: %s", b, d[i]);
        ab = ab + this.parseQuery(d[i], b);
        // now reset pointers so we can process remainder stuff on right side of brackets
        g = g.slice(c + d[i].length);
        //console.log("%s bottom of loop: ab = %s;;", b, ab);
      }

      // at this point all segments to the left of all brackets should already be processed
      // leaving only any possible segment to the right of last bracket (or if no brackets were present)
      // this remainder will be whats left in g
      if (g !== "") {
        ab = ab + this.processStuff(g, b);
      }
      //console.log("%s end of parseSegment: ab = %s;;", b, ab);
      return ab;
    } else {
      return this.parseQuery(a, b);
    }
  };

  private processStuff (s, b) {
    //console.log(b + ">> Inside processStuff. with s=" + s + ";;");
    b = b + "-";
    //split by operator
    var ab = s;
    if (this.pCOps.test(ab) || this.pMOps.test(ab) || this.pBOps.test(ab)) ab = this.processOps(ab);
    //console.log("%s end of processStuff: ab = %s;;", b, ab);
    return ab;
  };

  private processOps (s) {
    var b = "---";
    //console.log(b + ">> Inside processOps. with s=" + s + ";;");
    var re = this.pOps;
    var d = s.match(re); //get content
    var e = (d !== null) ? d.length : -1;
    var g = s;
    var ab = "";
    //console.log("%s b4 loop: d=%s;; d.length=%d;; d=%s;;", b, d, e, JSON.stringify(d));
    for (var i = 0; i < e; i++) {
      if (d[i] == null) break;
      //console.log("%s top of loop: g = %s;;", b, g);
      //atleast one binary ops-set was found -- will loop for each set found
      var c = g.search(re); //get index of {}
      if (c > 0) {
        var x = g.slice(0, c);
        //process left side of brackets and the brackets
        //console.log("%s process left side: g.slice(0, %d) => %s", b, c, x);
        if (this.pConst.test(x)) {
          ab = ab + x;
        } else {
          ab = ab + this.parseQuery(x, b + "--");
        }
      }
      ab = ab + d[i];
      // now reset pointers so we can process remainder stuff on right side of brackets
      g = g.slice(c + d[i].length);
      //console.log("%s bottom of loop: ab = %s;;", b, ab);
    }
    if (g !== "") {
      if (this.pConst.test(g)) {
        ab = ab + g;
      } else {
        ab = ab + this.parseQuery(g, b + "--");
      }
    }
    //console.log("%s end of processOps: ab = %s;;", b, ab);
    return ab;
  };

}

class Optimizer{
  private pointer: number;
  private orig: string[];

  constructor(os: string, rs: RegExp){
    this.orig = os.match(rs);
    this.pointer = 0;
  }

  swap(){
    return this.orig[this.pointer++];
  }
}