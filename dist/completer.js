System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var ScopedPromCompleter;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            ScopedPromCompleter = (function () {
                function ScopedPromCompleter(datasource) {
                    this.datasource = datasource;
                    this.identifierRegexps = [/\[/, /[a-zA-Z0-9_:]/];
                    this.labelQueryCache = {};
                    this.labelNameCache = {};
                    this.labelValueCache = {};
                }
                ScopedPromCompleter.prototype.getCompletions = function (editor, session, pos, prefix, callback) {
                    var token = session.getTokenAt(pos.row, pos.column);
                    switch (token.type) {
                        case 'entity.name.tag.label-matcher':
                            this.getCompletionsForLabelMatcherName(session, pos).then(function (completions) {
                                callback(null, completions);
                            });
                            return;
                        case 'string.quoted.label-matcher':
                            this.getCompletionsForLabelMatcherValue(session, pos).then(function (completions) {
                                callback(null, completions);
                            });
                            return;
                        case 'entity.name.tag.label-list-matcher':
                            this.getCompletionsForBinaryOperator(session, pos).then(function (completions) {
                                callback(null, completions);
                            });
                            return;
                    }
                    if (token.type === 'paren.lparen' && token.value === '[') {
                        var vectors = [];
                        for (var _i = 0, _a = ['s', 'm', 'h']; _i < _a.length; _i++) {
                            var unit = _a[_i];
                            for (var _b = 0, _c = [1, 5, 10, 30]; _b < _c.length; _b++) {
                                var value = _c[_b];
                                vectors.push({
                                    caption: value + unit,
                                    value: '[' + value + unit,
                                    meta: 'range vector',
                                });
                            }
                        }
                        vectors.unshift({
                            caption: '$__interval_ms',
                            value: '[$__interval_ms',
                            meta: 'range vector',
                        });
                        vectors.unshift({
                            caption: '$__interval',
                            value: '[$__interval',
                            meta: 'range vector',
                        });
                        callback(null, vectors);
                        return;
                    }
                    var query = prefix;
                    return this.datasource.performSuggestQuery(query, true).then(function (metricNames) {
                        callback(null, metricNames.map(function (name) {
                            var value = name;
                            if (prefix === '(') {
                                value = '(' + name;
                            }
                            return {
                                caption: name,
                                value: value,
                                meta: 'metric',
                            };
                        }));
                    });
                };
                ScopedPromCompleter.prototype.getCompletionsForLabelMatcherName = function (session, pos) {
                    var _this = this;
                    var metricName = this.findMetricName(session, pos.row, pos.column);
                    if (!metricName) {
                        return Promise.resolve(this.transformToCompletions(['__name__', 'instance', 'job'], 'label name'));
                    }
                    if (this.labelNameCache[metricName]) {
                        return Promise.resolve(this.labelNameCache[metricName]);
                    }
                    return this.getLabelNameAndValueForExpression(metricName, 'metricName').then(function (result) {
                        var labelNames = _this.transformToCompletions(lodash_1.default.uniq(lodash_1.default.flatten(result.map(function (r) {
                            return Object.keys(r.metric);
                        }))), 'label name');
                        _this.labelNameCache[metricName] = labelNames;
                        return Promise.resolve(labelNames);
                    });
                };
                ScopedPromCompleter.prototype.getCompletionsForLabelMatcherValue = function (session, pos) {
                    var _this = this;
                    var metricName = this.findMetricName(session, pos.row, pos.column);
                    if (!metricName) {
                        return Promise.resolve([]);
                    }
                    var labelNameToken = this.findToken(session, pos.row, pos.column, 'entity.name.tag.label-matcher', null, 'paren.lparen.label-matcher');
                    if (!labelNameToken) {
                        return Promise.resolve([]);
                    }
                    var labelName = labelNameToken.value;
                    if (this.labelValueCache[metricName] && this.labelValueCache[metricName][labelName]) {
                        return Promise.resolve(this.labelValueCache[metricName][labelName]);
                    }
                    return this.getLabelNameAndValueForExpression(metricName, 'metricName').then(function (result) {
                        var labelValues = _this.transformToCompletions(lodash_1.default.uniq(result.map(function (r) {
                            return r.metric[labelName];
                        })), 'label value');
                        _this.labelValueCache[metricName] = _this.labelValueCache[metricName] || {};
                        _this.labelValueCache[metricName][labelName] = labelValues;
                        return Promise.resolve(labelValues);
                    });
                };
                ScopedPromCompleter.prototype.getCompletionsForBinaryOperator = function (session, pos) {
                    var _this = this;
                    var keywordOperatorToken = this.findToken(session, pos.row, pos.column, 'keyword.control', null, 'identifier');
                    if (!keywordOperatorToken) {
                        return Promise.resolve([]);
                    }
                    var rparenToken, expr;
                    switch (keywordOperatorToken.value) {
                        case 'by':
                        case 'without':
                            rparenToken = this.findToken(session, keywordOperatorToken.row, keywordOperatorToken.column, 'paren.rparen', null, 'identifier');
                            if (!rparenToken) {
                                return Promise.resolve([]);
                            }
                            expr = this.findExpressionMatchedParen(session, rparenToken.row, rparenToken.column);
                            if (expr === '') {
                                return Promise.resolve([]);
                            }
                            return this.getLabelNameAndValueForExpression(expr, 'expression').then(function (result) {
                                var labelNames = _this.transformToCompletions(lodash_1.default.uniq(lodash_1.default.flatten(result.map(function (r) {
                                    return Object.keys(r.metric);
                                }))), 'label name');
                                _this.labelNameCache[expr] = labelNames;
                                return labelNames;
                            });
                        case 'on':
                        case 'ignoring':
                        case 'group_left':
                        case 'group_right':
                            var binaryOperatorToken = this.findToken(session, keywordOperatorToken.row, keywordOperatorToken.column, 'keyword.operator.binary', null, 'identifier');
                            if (!binaryOperatorToken) {
                                return Promise.resolve([]);
                            }
                            rparenToken = this.findToken(session, binaryOperatorToken.row, binaryOperatorToken.column, 'paren.rparen', null, 'identifier');
                            if (rparenToken) {
                                expr = this.findExpressionMatchedParen(session, rparenToken.row, rparenToken.column);
                                if (expr === '') {
                                    return Promise.resolve([]);
                                }
                                return this.getLabelNameAndValueForExpression(expr, 'expression').then(function (result) {
                                    var labelNames = _this.transformToCompletions(lodash_1.default.uniq(lodash_1.default.flatten(result.map(function (r) {
                                        return Object.keys(r.metric);
                                    }))), 'label name');
                                    _this.labelNameCache[expr] = labelNames;
                                    return labelNames;
                                });
                            }
                            else {
                                var metricName = this.findMetricName(session, binaryOperatorToken.row, binaryOperatorToken.column);
                                return this.getLabelNameAndValueForExpression(metricName, 'metricName').then(function (result) {
                                    var labelNames = _this.transformToCompletions(lodash_1.default.uniq(lodash_1.default.flatten(result.map(function (r) {
                                        return Object.keys(r.metric);
                                    }))), 'label name');
                                    _this.labelNameCache[metricName] = labelNames;
                                    return Promise.resolve(labelNames);
                                });
                            }
                    }
                    return Promise.resolve([]);
                };
                ScopedPromCompleter.prototype.getLabelNameAndValueForExpression = function (expr, type) {
                    var _this = this;
                    if (this.labelQueryCache[expr]) {
                        return Promise.resolve(this.labelQueryCache[expr]);
                    }
                    var query = expr;
                    if (type === 'metricName') {
                        var op = '=~';
                        if (/[a-zA-Z_:][a-zA-Z0-9_:]*/.test(expr)) {
                            op = '=';
                        }
                        query = '{__name__' + op + '"' + expr + '"}';
                    }
                    return this.datasource.performInstantQuery({ expr: query }, new Date().getTime() / 1000).then(function (response) {
                        _this.labelQueryCache[expr] = response.data.data.result;
                        return response.data.data.result;
                    });
                };
                ScopedPromCompleter.prototype.transformToCompletions = function (words, meta) {
                    return words.map(function (name) {
                        return {
                            caption: name,
                            value: name,
                            meta: meta,
                            score: Number.MAX_VALUE,
                        };
                    });
                };
                ScopedPromCompleter.prototype.findMetricName = function (session, row, column) {
                    var metricName = '';
                    var tokens;
                    var nameLabelNameToken = this.findToken(session, row, column, 'entity.name.tag.label-matcher', '__name__', 'paren.lparen.label-matcher');
                    if (nameLabelNameToken) {
                        tokens = session.getTokens(nameLabelNameToken.row);
                        var nameLabelValueToken = tokens[nameLabelNameToken.index + 2];
                        if (nameLabelValueToken && nameLabelValueToken.type === 'string.quoted.label-matcher') {
                            metricName = nameLabelValueToken.value.slice(1, -1); // cut begin/end quotation
                        }
                    }
                    else {
                        var metricNameToken = this.findToken(session, row, column, 'identifier', null, null);
                        if (metricNameToken) {
                            tokens = session.getTokens(metricNameToken.row);
                            metricName = metricNameToken.value;
                        }
                    }
                    return metricName;
                };
                ScopedPromCompleter.prototype.findToken = function (session, row, column, target, value, guard) {
                    var tokens, idx;
                    // find index and get column of previous token
                    for (var r = row; r >= 0; r--) {
                        var c = void 0;
                        tokens = session.getTokens(r);
                        if (r === row) {
                            // current row
                            c = 0;
                            for (idx = 0; idx < tokens.length; idx++) {
                                var nc = c + tokens[idx].value.length;
                                if (nc >= column) {
                                    break;
                                }
                                c = nc;
                            }
                        }
                        else {
                            idx = tokens.length - 1;
                            c =
                                lodash_1.default.sum(tokens.map(function (t) {
                                    return t.value.length;
                                })) - tokens[tokens.length - 1].value.length;
                        }
                        for (; idx >= 0; idx--) {
                            if (tokens[idx].type === guard) {
                                return null;
                            }
                            if (tokens[idx].type === target && (!value || tokens[idx].value === value)) {
                                tokens[idx].row = r;
                                tokens[idx].column = c;
                                tokens[idx].index = idx;
                                return tokens[idx];
                            }
                            c -= tokens[idx].value.length;
                        }
                    }
                    return null;
                };
                ScopedPromCompleter.prototype.findExpressionMatchedParen = function (session, row, column) {
                    var tokens, idx;
                    var deep = 1;
                    var expression = ')';
                    for (var r = row; r >= 0; r--) {
                        tokens = session.getTokens(r);
                        if (r === row) {
                            // current row
                            var c = 0;
                            for (idx = 0; idx < tokens.length; idx++) {
                                c += tokens[idx].value.length;
                                if (c >= column) {
                                    break;
                                }
                            }
                        }
                        else {
                            idx = tokens.length - 1;
                        }
                        for (; idx >= 0; idx--) {
                            expression = tokens[idx].value + expression;
                            if (tokens[idx].type === 'paren.rparen') {
                                deep++;
                            }
                            else if (tokens[idx].type === 'paren.lparen') {
                                deep--;
                                if (deep === 0) {
                                    return expression;
                                }
                            }
                        }
                    }
                    return expression;
                };
                return ScopedPromCompleter;
            })();
            exports_1("ScopedPromCompleter", ScopedPromCompleter);
        }
    }
});
//# sourceMappingURL=completer.js.map