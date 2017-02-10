// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// widget_core implements some common patterns for the core widget collection
// that are not to be used directly by third-party widget authors.

import {
    DOMWidgetModel, WidgetModel, LabeledDOMWidgetModel
} from './widget';

import * as _ from 'underscore';

var semver_range = `^${require('../package.json').version}`

export
class CoreWidgetModel extends WidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreWidgetModel',
            _model_module_version: semver_range,
            _view_module_version: semver_range
        });
    }
}

export
class CoreDOMWidgetModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreDOMWidgetModel',
            _model_module_version: semver_range,
            _view_module_version: semver_range
        });
    }
}

export
class CoreLabeledDOMWidgetModel extends LabeledDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CoreLabeledDOMWidgetModel',
            _model_module_version: semver_range,
            _view_module_version: semver_range
        });
    }
}
