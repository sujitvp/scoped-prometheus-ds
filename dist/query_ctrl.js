System.register(['angular', 'lodash', 'app/plugins/sdk', './css/query_editor.css!', './completer'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var angular_1, lodash_1, sdk_1, completer_1;
    var ScopedPrometheusQueryCtrl;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {},
            function (completer_1_1) {
                completer_1 = completer_1_1;
            }],
        execute: function() {
            //import './mode-prometheus';
            //import './snippets/prometheus';
            ScopedPrometheusQueryCtrl = (function (_super) {
                __extends(ScopedPrometheusQueryCtrl, _super);
                /** @ngInject */
                function ScopedPrometheusQueryCtrl($scope, $injector, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.templateSrv = templateSrv;
                    var target = this.target;
                    target.expr = target.expr || '';
                    target.intervalFactor = target.intervalFactor || 1;
                    target.format = target.format || this.getDefaultFormat();
                    this.metric = '';
                    this.resolutions = lodash_1.default.map([1, 2, 3, 4, 5, 10], function (f) {
                        return { factor: f, label: '1/' + f };
                    });
                    this.formats = [{ text: 'Time series', value: 'time_series' }, { text: 'Table', value: 'table' }];
                    this.instant = false;
                    this.updateLink();
                }
                ScopedPrometheusQueryCtrl.prototype.getCompleter = function (query) {
                    return new completer_1.ScopedPromCompleter(this.datasource);
                };
                ScopedPrometheusQueryCtrl.prototype.getDefaultFormat = function () {
                    if (this.panelCtrl.panel.type === 'table') {
                        return 'table';
                    }
                    return 'time_series';
                };
                ScopedPrometheusQueryCtrl.prototype.refreshMetricData = function () {
                    if (!lodash_1.default.isEqual(this.oldTarget, this.target)) {
                        this.oldTarget = angular_1.default.copy(this.target);
                        this.panelCtrl.refresh();
                        this.updateLink();
                    }
                };
                ScopedPrometheusQueryCtrl.prototype.updateLink = function () {
                    var range = this.panelCtrl.range;
                    if (!range) {
                        return;
                    }
                    var rangeDiff = Math.ceil((range.to.valueOf() - range.from.valueOf()) / 1000);
                    var endTime = range.to.utc().format('YYYY-MM-DD HH:mm');
                    var expr = {
                        'g0.expr': this.templateSrv.replace(this.target.expr, this.panelCtrl.panel.scopedVars, this.datasource.interpolateQueryExpr),
                        'g0.range_input': rangeDiff + 's',
                        'g0.end_input': endTime,
                        'g0.step_input': this.target.step,
                        'g0.stacked': this.panelCtrl.panel.stack ? 1 : 0,
                        'g0.tab': 0,
                    };
                    var args = lodash_1.default.map(expr, function (v, k) {
                        return k + '=' + encodeURIComponent(v);
                    }).join('&');
                    this.linkToPrometheus = this.datasource.directUrl + '/graph?' + args;
                };
                ScopedPrometheusQueryCtrl.prototype.getCollapsedText = function () {
                    return this.target.expr;
                };
                ScopedPrometheusQueryCtrl.templateUrl = 'partials/query.editor.html';
                return ScopedPrometheusQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("ScopedPrometheusQueryCtrl", ScopedPrometheusQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map