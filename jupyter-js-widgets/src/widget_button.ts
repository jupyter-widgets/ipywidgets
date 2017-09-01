// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView
} from './widget';

import {
    CoreDOMWidgetModel
} from './widget_core';

import {
    StyleModel
} from './widget_style';

import {
    Widget
} from 'phosphor/lib/ui/widget';

import * as _ from 'underscore';

export
class ButtonStyleModel extends StyleModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ButtonStyleModel',
        });
    }

    public static styleProperties = {
        button_color: {
            selector: '',
            attribute: 'background-color',
            default: null
        },
        font_weight: {
            selector: '',
            attribute: 'font-weight',
            default: ''
        }
    };
}

export
class ButtonModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            description: '',
            tooltip: '',
            disabled: false,
            icon: '',
            button_style: '',
            _view_name: 'ButtonView',
            _model_name: 'ButtonModel',
            style: void 0
        });
    }
}

export
class ButtonView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('jupyter-button');
        this.el.classList.add('widget-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.el.disabled = this.model.get('disabled');
        this.el.setAttribute('title', this.model.get('tooltip'));

        var description = this.model.get('description');
        var icon = this.model.get('icon');
        if (description.trim().length || icon.trim().length) {
            this.el.textContent = '';
            if (icon.trim().length) {
                var i = document.createElement('i');
                i.classList.add('fa');
                i.classList.add('fa-' + icon);
                if (description.trim().length === 0) {
                    i.classList.add('center');
                }
                this.el.appendChild(i);
            }
            this.el.appendChild(document.createTextNode(description));
        }
        return super.update();
    }

    update_button_style() {
        this.update_mapped_classes(ButtonView.class_map, 'button_style');
    }

    set_button_style() {
        this.set_mapped_classes(ButtonView.class_map, 'button_style');
    }

    /**
     * Dictionary of events and handlers
     */
    events(): {[e: string]: string} {
        // TODO: return typing not needed in Typescript later than 1.8.x
        // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
        return {'click': '_handle_click'};
    }

    /**
     * Handles when the button is clicked.
     */
    _handle_click(event) {
        event.preventDefault();
        this.send({event: 'click'});
    }

    /**
     * The default tag name.
     *
     * #### Notes
     * This is a read-only attribute.
     */
    get tagName() {
        // We can't make this an attribute with a default value
        // since it would be set after it is needed in the
        // constructor.
        return 'button';
    }

    el: HTMLButtonElement;

    static class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
}
