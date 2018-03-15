export default class ScopedPrometheusQueryParser {
    private pOperators;
    private pConstants;
    private pFunctions;
    private pKeywords;
    private pCOps;
    private pMOps;
    private pBOps;
    private pOps;
    private parenre;
    private pConst;
    private pString;
    private pq;
    private txttbl;
    private re;
    constructor();
    injectScopeIntoQuery: (query: string, scope: string) => string;
    private saveText(s);
    private retrieveText(s);
    private parseFunctions();
    private parseQuery(q, i?);
    private parseSegment(a, b);
    private processStuff(s, b);
    private processOps(s);
}
