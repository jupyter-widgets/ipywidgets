// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// widget_core implements some common patterns for the core widget collection
// that are not to be used directly by third-party widget authors.

import {
    DOMWidgetModel, WidgetModel, DOMWidgetView
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
class LabeledDOMWidgetModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            description: '',
        });
    }
}

export
class LabeledDOMWidgetView extends DOMWidgetView {

    render() {
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listenTo(this.model, 'change:description', this.updateDescription);
        this.updateDescription();
    }

    updateDescription() {
        let description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
        this.label.title = description;
    }

    label: HTMLDivElement;
}
