System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var ScopedPrometheusMetricFindQuery;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            ScopedPrometheusMetricFindQuery = (function () {
                function ScopedPrometheusMetricFindQuery(datasource, query, timeSrv) {
                    this.datasource = datasource;
                    this.query = query;
                    this.range = timeSrv.timeRange();
                }
                ScopedPrometheusMetricFindQuery.prototype.process = function () {
                    var label_values_regex = /^label_values\((?:(.+),\s*)?([a-zA-Z_][a-zA-Z0-9_]+)\)\s*$/;
                    var metric_names_regex = /^metrics\((.+)\)\s*$/;
                    var query_result_regex = /^query_result\((.+)\)\s*$/;
                    var label_values_query = this.query.match(label_values_regex);
                    if (label_values_query) {
                        if (label_values_query[1]) {
                            return this.labelValuesQuery(label_values_query[2], label_values_query[1]);
                        }
                        else {
                            return this.labelValuesQuery(label_values_query[2], null);
                        }
                    }
                    var metric_names_query = this.query.match(metric_names_regex);
                    if (metric_names_query) {
                        return this.metricNameQuery(metric_names_query[1]);
                    }
                    var query_result_query = this.query.match(query_result_regex);
                    if (query_result_query) {
                        return this.queryResultQuery(query_result_query[1]);
                    }
                    // if query contains full metric name, return metric name and label list
                    return this.metricNameAndLabelsQuery(this.query);
                };
                ScopedPrometheusMetricFindQuery.prototype.labelValuesQuery = function (label, metric) {
                    var url;
                    if (!metric) {
                        // return label values globally
                        url = '/api/v1/label/' + label + '/values';
                        return this.datasource._request('GET', url).then(function (result) {
                            return lodash_1.default.map(result.data.data, function (value) {
                                return { text: value };
                            });
                        });
                    }
                    else {
                        var start = this.datasource.getPrometheusTime(this.range.from, false);
                        var end = this.datasource.getPrometheusTime(this.range.to, true);
                        url = '/api/v1/series?match[]=' + encodeURIComponent(this.datasource.injectScope(metric)) + '&start=' + start + '&end=' + end;
                        return this.datasource._request('GET', url).then(function (result) {
                            var _labels = lodash_1.default.map(result.data.data, function (metric) {
                                return metric[label] || '';
                            }).filter(function (label) {
                                return label !== '';
                            });
                            return lodash_1.default.uniq(_labels).map(function (metric) {
                                return {
                                    text: metric,
                                    expandable: true,
                                };
                            });
                        });
                    }
                };
                ScopedPrometheusMetricFindQuery.prototype.metricNameQuery = function (metricFilterPattern) {
                    var url = '/api/v1/label/__name__/values';
                    return this.datasource._request('GET', url).then(function (result) {
                        return lodash_1.default.chain(result.data.data)
                            .filter(function (metricName) {
                            var r = new RegExp(metricFilterPattern);
                            return r.test(metricName);
                        })
                            .map(function (matchedMetricName) {
                            return {
                                text: matchedMetricName,
                                expandable: true,
                            };
                        })
                            .value();
                    });
                };
                ScopedPrometheusMetricFindQuery.prototype.queryResultQuery = function (query) {
                    var end = this.datasource.getPrometheusTime(this.range.to, true);
                    return this.datasource.performInstantQuery({ expr: query }, end).then(function (result) {
                        return lodash_1.default.map(result.data.data.result, function (metricData) {
                            var text = metricData.metric.__name__ || '';
                            delete metricData.metric.__name__;
                            text +=
                                '{' +
                                    lodash_1.default.map(metricData.metric, function (v, k) {
                                        return k + '="' + v + '"';
                                    }).join(',') +
                                    '}';
                            text += ' ' + metricData.value[1] + ' ' + metricData.value[0] * 1000;
                            return {
                                text: text,
                                expandable: true,
                            };
                        });
                    });
                };
                ScopedPrometheusMetricFindQuery.prototype.metricNameAndLabelsQuery = function (query) {
                    var start = this.datasource.getPrometheusTime(this.range.from, false);
                    var end = this.datasource.getPrometheusTime(this.range.to, true);
                    var url = '/api/v1/series?match[]=' + encodeURIComponent(this.datasource.injectScope(query)) + '&start=' + start + '&end=' + end;
                    var self = this;
                    return this.datasource._request('GET', url).then(function (result) {
                        return lodash_1.default.map(result.data.data, function (metric) {
                            return {
                                text: self.datasource.getOriginalMetricName(metric),
                                expandable: true,
                            };
                        });
                    });
                };
                return ScopedPrometheusMetricFindQuery;
            })();
            exports_1("default", ScopedPrometheusMetricFindQuery);
        }
    }
});
//# sourceMappingURL=metric_find_query.js.map