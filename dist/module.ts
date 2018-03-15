import ScopedPrometheusDatasource from './datasource';
import {ScopedPrometheusQueryCtrl} from './query_ctrl';
import {ScopedPrometheusConfigCtrl} from './config_ctrl';

class ScopedPrometheusAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  ScopedPrometheusDatasource as Datasource,
  ScopedPrometheusQueryCtrl as QueryCtrl,
  ScopedPrometheusConfigCtrl as ConfigCtrl,
  ScopedPrometheusAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
