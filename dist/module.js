System.register(['./datasource', './query_ctrl', './config_ctrl'], function(exports_1) {
    var datasource_1, query_ctrl_1, config_ctrl_1;
    var ScopedPrometheusAnnotationsQueryCtrl;
    return {
        setters:[
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            },
            function (config_ctrl_1_1) {
                config_ctrl_1 = config_ctrl_1_1;
            }],
        execute: function() {
            ScopedPrometheusAnnotationsQueryCtrl = (function () {
                function ScopedPrometheusAnnotationsQueryCtrl() {
                }
                ScopedPrometheusAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';
                return ScopedPrometheusAnnotationsQueryCtrl;
            })();
            exports_1("Datasource", datasource_1.default);
            exports_1("QueryCtrl", query_ctrl_1.ScopedPrometheusQueryCtrl);
            exports_1("ConfigCtrl", config_ctrl_1.ScopedPrometheusConfigCtrl);
            exports_1("AnnotationsQueryCtrl", ScopedPrometheusAnnotationsQueryCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map