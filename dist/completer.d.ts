import ScopedPrometheusDatasource from './datasource';
export declare class ScopedPromCompleter {
    private datasource;
    labelQueryCache: any;
    labelNameCache: any;
    labelValueCache: any;
    identifierRegexps: RegExp[];
    constructor(datasource: ScopedPrometheusDatasource);
    getCompletions(editor: any, session: any, pos: any, prefix: any, callback: any): any;
    getCompletionsForLabelMatcherName(session: any, pos: any): any;
    getCompletionsForLabelMatcherValue(session: any, pos: any): any;
    getCompletionsForBinaryOperator(session: any, pos: any): any;
    getLabelNameAndValueForExpression(expr: any, type: any): any;
    transformToCompletions(words: any, meta: any): any;
    findMetricName(session: any, row: any, column: any): string;
    findToken(session: any, row: any, column: any, target: any, value: any, guard: any): any;
    findExpressionMatchedParen(session: any, row: any, column: any): string;
}
