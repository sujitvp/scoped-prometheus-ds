///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/core/utils/kbn', 'app/core/utils/datemath', './metric_find_query', 'app/core/table_model', "./queryparser"], function(exports_1) {
    var lodash_1, kbn_1, dateMath, metric_find_query_1, table_model_1, queryparser_1;
    var ScopedPrometheusDatasource;
    function prometheusSpecialRegexEscape(value) {
        return value.replace(/[\\^$*+?.()|[\]{}]/g, '\\\\$&');
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (dateMath_1) {
                dateMath = dateMath_1;
            },
            function (metric_find_query_1_1) {
                metric_find_query_1 = metric_find_query_1_1;
            },
            function (table_model_1_1) {
                table_model_1 = table_model_1_1;
            },
            function (queryparser_1_1) {
                queryparser_1 = queryparser_1_1;
            }],
        execute: function() {
            ScopedPrometheusDatasource = (function () {
                /** @ngInject */
                function ScopedPrometheusDatasource(instanceSettings, $q, backendSrv, templateSrv, timeSrv) {
                    this.$q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.timeSrv = timeSrv;
                    this.type = 'prometheus';
                    this.editorSrc = 'app/features/prometheus/partials/query.editor.html';
                    this.name = instanceSettings.name;
                    this.supportMetrics = true;
                    this.url = instanceSettings.url;
                    this.directUrl = instanceSettings.directUrl;
                    this.basicAuth = instanceSettings.basicAuth;
                    this.withCredentials = instanceSettings.withCredentials;
                    this.interval = instanceSettings.jsonData.timeInterval || '15s';
                    this.scopeFilter = instanceSettings.jsonData.scopeFilter || '';
                    this.id = instanceSettings.id;
                }
                ScopedPrometheusDatasource.prototype._request = function (method, url, requestId) {
                    var options = {
                        url: this.url + url,
                        method: method,
                        requestId: requestId,
                    };
                    if (this.basicAuth || this.withCredentials) {
                        options.withCredentials = true;
                    }
                    if (this.basicAuth) {
                        options.headers = {
                            Authorization: this.basicAuth,
                        };
                    }
                    return this.backendSrv.datasourceRequest(options);
                };
                ScopedPrometheusDatasource.prototype.interpolateQueryExpr = function (value, variable, defaultFormatFn) {
                    // if no multi or include all do not regexEscape
                    if (!variable.multi && !variable.includeAll) {
                        return value;
                    }
                    if (typeof value === 'string') {
                        return prometheusSpecialRegexEscape(value);
                    }
                    var escapedValues = lodash_1.default.map(value, prometheusSpecialRegexEscape);
                    return escapedValues.join('|');
                };
                ScopedPrometheusDatasource.prototype.targetContainsTemplate = function (target) {
                    return this.templateSrv.variableExists(target.expr);
                };
                ScopedPrometheusDatasource.prototype.query = function (options) {
                    var _this = this;
                    var self = this;
                    var start = this.getPrometheusTime(options.range.from, false);
                    var end = this.getPrometheusTime(options.range.to, true);
                    var range = Math.ceil(end - start);
                    var queries = [];
                    var activeTargets = [];
                    options = lodash_1.default.clone(options);
                    for (var _i = 0, _a = options.targets; _i < _a.length; _i++) {
                        var target = _a[_i];
                        if (!target.expr || target.hide) {
                            continue;
                        }
                        activeTargets.push(target);
                        queries.push(this.createQuery(target, options, range));
                    }
                    // No valid targets, return the empty result to save a round trip.
                    if (lodash_1.default.isEmpty(queries)) {
                        return this.$q.when({ data: [] });
                    }
                    var allQueryPromise = lodash_1.default.map(queries, function (query) {
                        if (!query.instant) {
                            return _this.performTimeSeriesQuery(query, start, end);
                        }
                        else {
                            return _this.performInstantQuery(query, end);
                        }
                    });
                    return this.$q.all(allQueryPromise).then(function (responseList) {
                        var result = [];
                        lodash_1.default.each(responseList, function (response, index) {
                            if (response.status === 'error') {
                                throw response.error;
                            }
                            if (activeTargets[index].format === 'table') {
                                result.push(self.transformMetricDataToTable(response.data.data.result, responseList.length, index));
                            }
                            else {
                                for (var _i = 0, _a = response.data.data.result; _i < _a.length; _i++) {
                                    var metricData = _a[_i];
                                    if (response.data.data.resultType === 'matrix') {
                                        result.push(self.transformMetricData(metricData, activeTargets[index], start, end, queries[index].step));
                                    }
                                    else if (response.data.data.resultType === 'vector') {
                                        result.push(self.transformInstantMetricData(metricData, activeTargets[index]));
                                    }
                                }
                            }
                        });
                        return { data: result };
                    });
                };
                ScopedPrometheusDatasource.prototype.createQuery = function (target, options, range) {
                    var query = {};
                    query.instant = target.instant;
                    var interval = kbn_1.default.interval_to_seconds(options.interval);
                    // Minimum interval ("Min step"), if specified for the query. or same as interval otherwise
                    var minInterval = kbn_1.default.interval_to_seconds(this.templateSrv.replace(target.interval, options.scopedVars) || options.interval);
                    var intervalFactor = target.intervalFactor || 1;
                    // Adjust the interval to take into account any specified minimum and interval factor plus Prometheus limits
                    var adjustedInterval = this.adjustInterval(interval, minInterval, range, intervalFactor);
                    var scopedVars = options.scopedVars;
                    // If the interval was adjusted, make a shallow copy of scopedVars with updated interval vars
                    if (interval !== adjustedInterval) {
                        interval = adjustedInterval;
                        scopedVars = Object.assign({}, options.scopedVars, {
                            __interval: { text: interval + 's', value: interval + 's' },
                            __interval_ms: { text: interval * 1000, value: interval * 1000 },
                        });
                    }
                    query.step = interval;
                    // Only replace vars in expression after having (possibly) updated interval vars
                    query.expr = this.templateSrv.replace(target.expr, scopedVars, this.interpolateQueryExpr);
                    query.requestId = options.panelId + target.refId;
                    return query;
                };
                ScopedPrometheusDatasource.prototype.injectScope = function (expr) {
                    if (!this.qparser)
                        this.qparser = new queryparser_1.default();
                    return this.qparser.injectScopeIntoQuery(expr, this.scopeFilter);
                };
                ScopedPrometheusDatasource.prototype.adjustInterval = function (interval, minInterval, range, intervalFactor) {
                    // Prometheus will drop queries that might return more than 11000 data points.
                    // Calibrate interval if it is too small.
                    if (interval !== 0 && range / intervalFactor / interval > 11000) {
                        interval = Math.ceil(range / intervalFactor / 11000);
                    }
                    return Math.max(interval * intervalFactor, minInterval, 1);
                };
                ScopedPrometheusDatasource.prototype.performTimeSeriesQuery = function (query, start, end) {
                    if (start > end) {
                        throw { message: 'Invalid time range' };
                    }
                    query.expr = this.injectScope(query.expr);
                    var url = '/api/v1/query_range?query=' +
                        encodeURIComponent(query.expr) +
                        '&start=' +
                        start +
                        '&end=' +
                        end +
                        '&step=' +
                        query.step;
                    return this._request('GET', url, query.requestId);
                };
                ScopedPrometheusDatasource.prototype.performInstantQuery = function (query, time) {
                    query.expr = this.injectScope(query.expr);
                    var url = '/api/v1/query?query=' + encodeURIComponent(query.expr) + '&time=' + time;
                    return this._request('GET', url, query.requestId);
                };
                ScopedPrometheusDatasource.prototype.performSuggestQuery = function (query, cache) {
                    var _this = this;
                    if (cache === void 0) { cache = false; }
                    var url = '/api/v1/label/__name__/values';
                    if (cache && this.metricsNameCache && this.metricsNameCache.expire > Date.now()) {
                        return this.$q.when(lodash_1.default.filter(this.metricsNameCache.data, function (metricName) {
                            return metricName.indexOf(query) !== 1;
                        }));
                    }
                    return this._request('GET', url).then(function (result) {
                        _this.metricsNameCache = {
                            data: result.data.data,
                            expire: Date.now() + 60 * 1000,
                        };
                        return lodash_1.default.filter(result.data.data, function (metricName) {
                            return metricName.indexOf(query) !== 1;
                        });
                    });
                };
                ScopedPrometheusDatasource.prototype.metricFindQuery = function (query) {
                    if (!query) {
                        return this.$q.when([]);
                    }
                    var interpolated = this.templateSrv.replace(query, {}, this.interpolateQueryExpr);
                    var metricFindQuery = new metric_find_query_1.default(this, interpolated, this.timeSrv);
                    return metricFindQuery.process();
                };
                ScopedPrometheusDatasource.prototype.annotationQuery = function (options) {
                    var annotation = options.annotation;
                    var expr = annotation.expr || '';
                    var tagKeys = annotation.tagKeys || '';
                    var titleFormat = annotation.titleFormat || '';
                    var textFormat = annotation.textFormat || '';
                    if (!expr) {
                        return this.$q.when([]);
                    }
                    var interpolated = this.templateSrv.replace(expr, {}, this.interpolateQueryExpr);
                    var step = '60s';
                    if (annotation.step) {
                        step = this.templateSrv.replace(annotation.step);
                    }
                    var start = this.getPrometheusTime(options.range.from, false);
                    var end = this.getPrometheusTime(options.range.to, true);
                    var query = {
                        expr: interpolated,
                        step: this.adjustInterval(kbn_1.default.interval_to_seconds(step), 0, Math.ceil(end - start), 1) + 's',
                    };
                    var self = this;
                    return this.performTimeSeriesQuery(query, start, end).then(function (results) {
                        var eventList = [];
                        tagKeys = tagKeys.split(',');
                        lodash_1.default.each(results.data.data.result, function (series) {
                            var tags = lodash_1.default.chain(series.metric)
                                .filter(function (v, k) {
                                return lodash_1.default.includes(tagKeys, k);
                            })
                                .value();
                            for (var _i = 0, _a = series.values; _i < _a.length; _i++) {
                                var value = _a[_i];
                                if (value[1] === '1') {
                                    var event = {
                                        annotation: annotation,
                                        time: Math.floor(parseFloat(value[0])) * 1000,
                                        title: self.renderTemplate(titleFormat, series.metric),
                                        tags: tags,
                                        text: self.renderTemplate(textFormat, series.metric),
                                    };
                                    eventList.push(event);
                                }
                            }
                        });
                        return eventList;
                    });
                };
                ScopedPrometheusDatasource.prototype.testDatasource = function () {
                    return this.metricFindQuery('metrics(.*)').then(function () {
                        return { status: 'success', message: 'Data source is working' };
                    });
                };
                ScopedPrometheusDatasource.prototype.transformMetricData = function (md, options, start, end, step) {
                    var dps = [], metricLabel = null;
                    metricLabel = this.createMetricLabel(md.metric, options);
                    var stepMs = step * 1000;
                    var baseTimestamp = start * 1000;
                    for (var _i = 0, _a = md.values; _i < _a.length; _i++) {
                        var value = _a[_i];
                        var dp_value = parseFloat(value[1]);
                        if (lodash_1.default.isNaN(dp_value)) {
                            dp_value = null;
                        }
                        var timestamp = parseFloat(value[0]) * 1000;
                        for (var t = baseTimestamp; t < timestamp; t += stepMs) {
                            dps.push([null, t]);
                        }
                        baseTimestamp = timestamp + stepMs;
                        dps.push([dp_value, timestamp]);
                    }
                    var endTimestamp = end * 1000;
                    for (var t = baseTimestamp; t <= endTimestamp; t += stepMs) {
                        dps.push([null, t]);
                    }
                    return { target: metricLabel, datapoints: dps };
                };
                ScopedPrometheusDatasource.prototype.transformMetricDataToTable = function (md, resultCount, resultIndex) {
                    var table = new table_model_1.default();
                    var i, j;
                    var metricLabels = {};
                    if (md.length === 0) {
                        return table;
                    }
                    // Collect all labels across all metrics
                    lodash_1.default.each(md, function (series) {
                        for (var label in series.metric) {
                            if (!metricLabels.hasOwnProperty(label)) {
                                metricLabels[label] = 1;
                            }
                        }
                    });
                    // Sort metric labels, create columns for them and record their index
                    var sortedLabels = lodash_1.default.keys(metricLabels).sort();
                    table.columns.push({ text: 'Time', type: 'time' });
                    lodash_1.default.each(sortedLabels, function (label, labelIndex) {
                        metricLabels[label] = labelIndex + 1;
                        table.columns.push({ text: label });
                    });
                    var valueText = resultCount > 1 ? "Value #" + String.fromCharCode(65 + resultIndex) : 'Value';
                    table.columns.push({ text: valueText });
                    // Populate rows, set value to empty string when label not present.
                    lodash_1.default.each(md, function (series) {
                        if (series.value) {
                            series.values = [series.value];
                        }
                        if (series.values) {
                            for (i = 0; i < series.values.length; i++) {
                                var values = series.values[i];
                                var reordered = [values[0] * 1000];
                                if (series.metric) {
                                    for (j = 0; j < sortedLabels.length; j++) {
                                        var label = sortedLabels[j];
                                        if (series.metric.hasOwnProperty(label)) {
                                            reordered.push(series.metric[label]);
                                        }
                                        else {
                                            reordered.push('');
                                        }
                                    }
                                }
                                reordered.push(parseFloat(values[1]));
                                table.rows.push(reordered);
                            }
                        }
                    });
                    return table;
                };
                ScopedPrometheusDatasource.prototype.transformInstantMetricData = function (md, options) {
                    var dps = [], metricLabel = null;
                    metricLabel = this.createMetricLabel(md.metric, options);
                    dps.push([parseFloat(md.value[1]), md.value[0] * 1000]);
                    return { target: metricLabel, datapoints: dps };
                };
                ScopedPrometheusDatasource.prototype.createMetricLabel = function (labelData, options) {
                    if (lodash_1.default.isUndefined(options) || lodash_1.default.isEmpty(options.legendFormat)) {
                        return this.getOriginalMetricName(labelData);
                    }
                    return this.renderTemplate(this.templateSrv.replace(options.legendFormat), labelData) || '{}';
                };
                ScopedPrometheusDatasource.prototype.renderTemplate = function (aliasPattern, aliasData) {
                    var aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
                    return aliasPattern.replace(aliasRegex, function (match, g1) {
                        if (aliasData[g1]) {
                            return aliasData[g1];
                        }
                        return g1;
                    });
                };
                ScopedPrometheusDatasource.prototype.getOriginalMetricName = function (labelData) {
                    var metricName = labelData.__name__ || '';
                    delete labelData.__name__;
                    var labelPart = lodash_1.default.map(lodash_1.default.toPairs(labelData), function (label) {
                        return label[0] + '="' + label[1] + '"';
                    }).join(',');
                    return metricName + '{' + labelPart + '}';
                };
                ScopedPrometheusDatasource.prototype.getPrometheusTime = function (date, roundUp) {
                    if (lodash_1.default.isString(date)) {
                        date = dateMath.parse(date, roundUp);
                    }
                    return Math.ceil(date.valueOf() / 1000);
                };
                return ScopedPrometheusDatasource;
            })();
            exports_1("default", ScopedPrometheusDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map