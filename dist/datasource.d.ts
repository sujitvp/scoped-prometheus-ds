/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import ScopedPrometheusQueryParser from "./queryparser";
export default class ScopedPrometheusDatasource {
    private $q;
    private backendSrv;
    private templateSrv;
    private timeSrv;
    id: number;
    name: string;
    type: string;
    editorSrc: string;
    supportMetrics: boolean;
    url: string;
    directUrl: string;
    basicAuth: any;
    withCredentials: any;
    metricsNameCache: any;
    interval: string;
    scopeFilter: string;
    qparser: ScopedPrometheusQueryParser;
    /** @ngInject */
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any, timeSrv: any);
    _request(method: any, url: any, requestId?: any): any;
    interpolateQueryExpr(value: any, variable: any, defaultFormatFn: any): any;
    targetContainsTemplate(target: any): any;
    query(options: any): any;
    createQuery(target: any, options: any, range: any): any;
    injectScope(expr: any): string;
    adjustInterval(interval: any, minInterval: any, range: any, intervalFactor: any): number;
    performTimeSeriesQuery(query: any, start: any, end: any): any;
    performInstantQuery(query: any, time: any): any;
    performSuggestQuery(query: any, cache?: boolean): any;
    metricFindQuery(query: any): any;
    annotationQuery(options: any): any;
    testDatasource(): any;
    transformMetricData(md: any, options: any, start: any, end: any, step: any): {
        target: any;
        datapoints: any[];
    };
    transformMetricDataToTable(md: any, resultCount: number, resultIndex: number): any;
    transformInstantMetricData(md: any, options: any): {
        target: any;
        datapoints: any[];
    };
    createMetricLabel(labelData: any, options: any): any;
    renderTemplate(aliasPattern: any, aliasData: any): any;
    getOriginalMetricName(labelData: any): string;
    getPrometheusTime(date: any, roundUp: any): number;
}
