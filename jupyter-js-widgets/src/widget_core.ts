// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// widget_core implements some common patterns for the core widget collection
// that are not to be used directly by third-party widget authors.

import {
    DOMWidgetModel, WidgetModel, LabeledDOMWidgetModel
} from './widget';

import * as _ from 'underscore';

let jupyterWidgetSpecVersion = '3';

export
class CoreWidgetModel extends WidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreWidgetModel',
            _model_module_version: jupyterWidgetSpecVersion,
            _view_module_version: jupyterWidgetSpecVersion
        });
    }
}

export
class CoreDOMWidgetModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreDOMWidgetModel',
            _model_module_version: jupyterWidgetSpecVersion,
            _view_module_version: jupyterWidgetSpecVersion
        });
    }
}

export
class CoreLabeledDOMWidgetModel extends LabeledDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreLabeledDOMWidgetModel',
            _model_module_version: jupyterWidgetSpecVersion,
            _view_module_version: jupyterWidgetSpecVersion
        });
    }
}
