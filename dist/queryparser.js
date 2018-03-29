System.register([], function(exports_1) {
    var ScopedPrometheusQueryParser, Optimizer;
    return {
        setters:[],
        execute: function() {
            ScopedPrometheusQueryParser = (function () {
                function ScopedPrometheusQueryParser() {
                    // tslint:disable:max-line-length
                    // tslint:disable:no-console
                    this.pOperators = /count|count_values|min|max|avg|sum|stddev|stdvar|bottomk|topk|quantile/i;
                    this.pConstants = /true|false|null|__name__|job/i;
                    this.pFunctions = /abs|absent|ceil|changes|clamp_max|clamp_min|count_scalar|day_of_month|day_of_week|days_in_month|delta|deriv|drop_common_labels|exp|floor|histogram_quantile|holt_winters|hour|idelta|increase|irate|label_replace|ln|log2|log10|minute|month|predict_linear|rate|resets|round|scalar|sort|sort_desc|sqrt|time|vector|year|avg_over_time|min_over_time|max_over_time|sum_over_time|count_over_time|quantile_over_time|stddev_over_time|stdvar_over_time/;
                    this.pKeywords = /by|without|ignoring|on|group_left|group_right/i;
                    this.pCOps = /\s*(?:==|!=|>|<|>=|<=)(?:\s+bool\s+)?\s*/gi;
                    this.pMOps = /\s*\+|-|\*|\/|%|\^\s*/g;
                    this.pBOps = /(?:[})\s\]](?:and|or|unless)[\s{(])/gi;
                    this.pOps = new RegExp(this.pCOps.source + "|" + this.pMOps.source + "|" + this.pBOps.source, "ig");
                    this.parenre = /((?:[a-zA-Z_:][a-zA-Z0-9_:]*)?\{[^}]+\}(?:\[\d+[hmsdw]\])?)/gi;
                    this.pConst = /^\s*(?:(?:-?(?:(?:\d*\.\d+)|\d+)%?)|true|false|null|__##[0-9a-z]{6}##__|__\$#\$TRING\$#\$__|\s)\s*$/i;
                    this.pString = /("[^"]*")|(\{\{%[A-Z_]+%\}\})/g;
                    this.pq = {};
                    this.txttbl = {};
                    this.re = [
                        //    ["must", this.pString, this.saveText.bind(this), "post", ""],
                        ["must", /^(\s*(?:[a-zA-Z_:][a-zA-Z0-9_:]*)?\s*)\{([^}]+)\}(\s*\[\d+[hmsdw]\])?(\s+offset\s+\d+[hmsdw]\s*)?$/i, "$1{$$SCOPE,$2}$3$4", "preops", "may"],
                        ["must", /^(\s*(?:[a-zA-Z_:][a-zA-Z0-9_:]*)?\s*)(\s*\[\d+[hmsdw]\])?(\s+offset\s+\d+[hmsdw]\s*)$/i, "$1{$$SCOPE}$2$3", "preops", "may"],
                        ["must", /^(\s*(?:[a-zA-Z_:][a-zA-Z0-9_:]*)?\s*)(\s*\[\d+[hmsdw]\])?(?!\s+offset\s+\d+[hmsdw])$/i, "$1{$$SCOPE}$2", "preops", "may"],
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
                    ];
                    //console.log("New instance of datasource constructed...");
                }
                ScopedPrometheusQueryParser.prototype.injectScopeIntoQuery = function (query, scope) {
                    console.time("injectScope Timer");
                    var q = query.replace(this.pString, "\"__$$#$$TRING$$#$$__\"");
                    //console.log("cached query count: %d;; using q= %s", Object.keys(this.pq).length, q);
                    console.info(">> Inside injectScopeIntoQuery. with query=%s;;", query);
                    if (!this.pq.hasOwnProperty(q)) {
                        this.pq[q] = this.parseQuery(q, "0");
                    }
                    var o = new Optimizer(query, this.pString);
                    var ret = this.pq[q].replace(this.pString, o.swap.bind(o)).replace(/\$SCOPE/g, scope);
                    console.timeEnd("injectScope Timer");
                    return ret;
                };
                ScopedPrometheusQueryParser.prototype.getCache = function () {
                    return Object.keys(this.pq);
                };
                ScopedPrometheusQueryParser.prototype.clearCache = function () {
                    this.pq = {};
                };
                ScopedPrometheusQueryParser.prototype.saveText = function (s) {
                    if (!this.txttbl) {
                        this.txttbl = {};
                    }
                    while (true) {
                        // tslint:disable-next-line:no-bitwise
                        var uid = "__##" + ("0000" + ((((new Date()).getTime() * Math.pow(36, 4)) | 0) * 10).toString(36)).slice(-6) + "##__";
                        if (!this.txttbl.hasOwnProperty(uid)) {
                            this.txttbl[uid] = s;
                            return uid;
                        }
                    }
                };
                ScopedPrometheusQueryParser.prototype.retrieveText = function (s) {
                    console.assert(this.txttbl.hasOwnProperty(s));
                    if (this.txttbl.hasOwnProperty(s)) {
                        var ret = this.txttbl[s];
                        delete this.txttbl[s];
                        return ret;
                    }
                };
                ScopedPrometheusQueryParser.prototype.parseFunctions = function () {
                    //console.log(">> inside parseFunctions");
                    for (var x = 0; x < arguments.length; x++) {
                    }
                    if (arguments[1] !== "") {
                        // does not start with a bracket
                        if (this.pKeywords.test(arguments[1])) {
                            // if keywords, then the internal content is not a query
                            return arguments[0];
                        }
                        else if (this.pOperators.test(arguments[1]) || this.pFunctions.test(arguments[1])) {
                            // if functions or operators, then the internal content is possibly a query or more cascaded functions/ops
                            return arguments[1] + "(" + this.parseFunctionArguments(arguments[2], "--") + ")";
                        }
                    }
                    else {
                        //starts with a bracket, so process as if this was a query
                        return "(" + this.parseFunctionArguments(arguments[2], "--") + ")";
                    }
                };
                ScopedPrometheusQueryParser.prototype.parseQuery = function (q, i) {
                    var stack = {};
                    stack["must"] = 1;
                    stack["may"] = 1;
                    for (var k = 0; k < this.re.length; k++) {
                        if (stack.hasOwnProperty(this.re[k][0])) {
                            var m;
                            if ((m = this.re[k][1].exec(q)) !== null) {
                                for (var j = 0; j < m.length; j++) {
                                }
                                q = q.replace(this.re[k][1], this.re[k][2]);
                                if (this.re[k][3]) {
                                    stack[this.re[k][3]] = 1;
                                }
                                if (this.re[k][4]) {
                                    delete stack[this.re[k][4]];
                                }
                            }
                            else {
                            }
                        }
                    }
                    return q;
                };
                ScopedPrometheusQueryParser.prototype.parseFunctionArguments = function (a, b) {
                    b = b + "--";
                    //console.log(b + ">> inside parseFunctionArguments: " + a);
                    //first split into constituent queries, and everything else
                    var d = a.match(this.parenre); //get content
                    var e = (d !== null) ? d.length : -1;
                    var g = a;
                    var ab = "";
                    //console.log("%s b4 loop: d=%s;; d.length=%d;;", b, d, e);
                    // at this point there are one or more queries (metric + selector or selector alone) selected
                    // and outside of the selections there are possible metrics, functions, constants and operators
                    // but no selectors: {...}
                    // lets start by looping over each query-selector selected, and processing
                    // it and content to its left
                    for (var i = 0; i < e; i++) {
                        // since we are inside the loop, atleast one query-selector was found
                        // get its location for slicing
                        var c = g.search(this.parenre); //get index of {}
                        if (c > 0) {
                            //process the content to the left of the selected query-selector
                            // the content may contain:
                            // - other arguments to the parent function, separated by comma
                            //console.log("%s process left side: g.slice(0, %d)", b, c);
                            ab = ab + this.processargs(g.slice(0, c), b);
                        }
                        //process the bracket set
                        //console.log("%s process bracket stuff: %s", b, d[i]);
                        ab = ab + this.parseQuery(d[i], b);
                        // now reset pointers so we can process remainder stuff on right side of brackets
                        g = g.slice(c + d[i].length);
                    }
                    // at this point all segments to the left of all brackets should already be processed
                    // leaving only any possible segment to the right of last bracket (or if no brackets were present)
                    // this remainder will be whats left in g
                    if (g !== "") {
                        ab = ab + this.processargs(g, b);
                    }
                    //console.log("%s end of parseFunctionArguments: ab = %s;;", b, ab);
                    return ab;
                };
                ScopedPrometheusQueryParser.prototype.processargs = function (s, b) {
                    b = b + "--";
                    //console.log("%s >> inside processargs: %s;;",b, s);
                    var x = s.split(',');
                    var ab = "";
                    for (var j = 0; j < x.length; j++) {
                        // each section represents a different argument to the parent function
                        // the content may possibly contain:
                        // - contants separated by operators
                        // - other queries without selectors separated by operators
                        //first test to see if the query has binary operators
                        //console.log("%s processing seg x[%d] of %d, for operators: %s;;", b, j, x.length, x[j]);
                        if (x[j] !== "") {
                            if (this.pOps.test(x[j])) {
                                ab = ab + this.processOps(x[j]);
                            }
                            else {
                                if (this.pConst.test(x[j])) {
                                    ab = ab + x[j];
                                }
                                else {
                                    ab = ab + this.parseQuery(x[j], b);
                                }
                            }
                        }
                        if ((j + 1) < x.length) {
                            ab = ab + ",";
                        }
                    }
                    //console.log("%s end of processargs: ab = %s;;", b, ab);
                    return ab;
                };
                ScopedPrometheusQueryParser.prototype.processOps = function (s) {
                    var b = "---";
                    //console.log(b + ">> Inside processOps. with s=" + s + ";;");
                    var re = this.pOps;
                    var d = s.match(re); //get content
                    var e = (d !== null) ? d.length : -1;
                    var g = s;
                    var ab = "";
                    //console.log("%s b4 loop: d=%s;; d.length=%d;; d=%s;;", b, d, e, JSON.stringify(d));
                    for (var i = 0; i < e; i++) {
                        if (d[i] == null) {
                            break;
                        }
                        //console.log("%s top of loop: g = %s;;", b, g);
                        //atleast one binary ops-set was found -- will loop for each set found
                        var c = g.search(re); //get index of Operators
                        if (c > 0) {
                            var x = g.slice(0, c);
                            //process left side of operators
                            //console.log("%s process left side: g.slice(0, %d) => %s", b, c, x);
                            if (this.pConst.test(x)) {
                                ab = ab + x;
                            }
                            else {
                                ab = ab + this.parseQuery(x, b);
                            }
                        }
                        ab = ab + d[i];
                        // now reset pointers so we can process remainder stuff on right side of brackets
                        g = g.slice(c + d[i].length);
                    }
                    if (g !== "") {
                        if (this.pConst.test(g)) {
                            ab = ab + g;
                        }
                        else {
                            ab = ab + this.parseQuery(g, b);
                        }
                    }
                    //console.log("%s end of processOps: ab = %s;;", b, ab);
                    return ab;
                };
                return ScopedPrometheusQueryParser;
            })();
            exports_1("default", ScopedPrometheusQueryParser);
            Optimizer = (function () {
                function Optimizer(os, rs) {
                    this.orig = os.match(rs);
                    this.pointer = 0;
                }
                Optimizer.prototype.swap = function () {
                    return this.orig[this.pointer++];
                };
                return Optimizer;
            })();
        }
    }
});
//# sourceMappingURL=queryparser.js.map