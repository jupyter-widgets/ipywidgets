// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, StyleModel
} from 'jupyter-widgets-base';

import {
    typeset
} from './utils';

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
        this.label = document.createElement('label');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listenTo(this.model, 'change:description', this.updateDescription);
        this.updateDescription();
    }

    typeset(element, text?){
        this.displayed.then(() => typeset(element, text));
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

    label: HTMLLabelElement;
}

/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionModel instead.
 */
export
class LabeledDOMWidgetModel extends DescriptionModel {};

/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionView instead.
 */
export
class LabeledDOMWidgetView extends DescriptionView {};
