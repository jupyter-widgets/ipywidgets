
import {
    DOMWidgetModel, DOMWidgetView
} from '@jupyter-widgets/base';

export class OutputModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'OutputModel',
            _view_name: 'OutputView',
            _model_module: '@jupyter-widgets/output',
            _view_module: '@jupyter-widgets/output'
        }
    }
}

export class OutputView extends DOMWidgetView {}
