export default class ScopedPrometheusMetricFindQuery {
    datasource: any;
    query: any;
    range: any;
    constructor(datasource: any, query: any, timeSrv: any);
    process(): any;
    labelValuesQuery(label: any, metric: any): any;
    metricNameQuery(metricFilterPattern: any): any;
    queryResultQuery(query: any): any;
    metricNameAndLabelsQuery(query: any): any;
}
