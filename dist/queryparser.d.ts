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
    injectScopeIntoQuery(query: string, scope: string): string;
    getCache(): string[];
    clearCache(): void;
    private saveText(s);
    private retrieveText(s);
    private parseFunctions();
    private parseQuery(q, i?);
    private parseFunctionArguments(a, b);
    private processargs(s, b);
    private processOps(s);
}
