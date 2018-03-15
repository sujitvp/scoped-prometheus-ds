/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
import { ScopedPromCompleter } from './completer';
export declare class ScopedPrometheusQueryCtrl extends QueryCtrl {
    private templateSrv;
    static templateUrl: string;
    metric: any;
    resolutions: any;
    formats: any;
    instant: any;
    oldTarget: any;
    suggestMetrics: any;
    getMetricsAutocomplete: any;
    linkToPrometheus: any;
    /** @ngInject */
    constructor($scope: any, $injector: any, templateSrv: any);
    getCompleter(query: any): ScopedPromCompleter;
    getDefaultFormat(): string;
    refreshMetricData(): void;
    updateLink(): void;
    getCollapsedText(): any;
}
