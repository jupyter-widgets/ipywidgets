// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView
} from './widget';

import {
    StyleModel
} from './widget_style';

export
class DescriptionStyleModel extends StyleModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'DescriptionStyleModel',
        };
    }

    public static styleProperties = {
        description_width: {
            selector: '.widget-label',
            attribute: 'width',
            default: null
        },
    };
}

export
class DescriptionModel extends DOMWidgetModel {
    defaults() {
        return {...super.defaults(),
            description: '',
        };
    }
}

export
class DescriptionView extends DOMWidgetView {

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
            this.label.innerHTML = description;
            this.typeset(this.label);
            this.label.style.display = '';
        }
        this.label.title = description;
    }

    label: HTMLDivElement;
}

export
class LabeledDOMWidgetModel extends DescriptionModel {};

export
class LabeledDOMWidgetView extends DescriptionView {};