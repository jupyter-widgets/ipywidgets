// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView
} from '../../jupyter-js-widgets';

export class OutputModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'OutputModel',
            _view_name: 'OutputView',
            msg_id: ''
        }
    }
}

export class OutputView extends DOMWidgetView {
    render() {
        console.log('hello view')
    }
}

