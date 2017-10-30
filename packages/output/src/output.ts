
import {
    DOMWidgetModel, DOMWidgetView, JUPYTER_WIDGETS_VERSION
} from '@jupyter-widgets/base';

export
const OUTPUT_WIDGET_VERSION = JUPYTER_WIDGETS_VERSION;

export class OutputModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'OutputModel',
            _view_name: 'OutputView',
            _model_module: '@jupyter-widgets/output',
            _view_module: '@jupyter-widgets/output',
            _model_module_version: OUTPUT_WIDGET_VERSION,
            _view_module_version: OUTPUT_WIDGET_VERSION,
        };
    }
}

export class OutputView extends DOMWidgetView {}
