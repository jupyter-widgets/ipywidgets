// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// widget_core implements some common patterns for the core widget collection
// that are not to be used directly by third-party widget authors.

import {
    DOMWidgetModel, WidgetModel
} from '@jupyter-widgets/base';

import {
    DescriptionModel
} from './widget_description';

import * as _ from 'underscore';

export
class CoreWidgetModel extends WidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreWidgetModel',
            _view_module: '@jupyter-widgets/controls',
            _model_module: '@jupyter-widgets/controls',
        });
    }
}

export
class CoreDOMWidgetModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreDOMWidgetModel',
            _view_module: '@jupyter-widgets/controls',
            _model_module: '@jupyter-widgets/controls',
        });
    }
}

export
class CoreDescriptionModel extends DescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreDescriptionModel',
            _view_module: '@jupyter-widgets/controls',
            _model_module: '@jupyter-widgets/controls',
        });
    }
}
