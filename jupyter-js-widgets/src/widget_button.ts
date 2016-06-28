// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView
} from './widget';

import {
    Widget
} from 'phosphor/lib/ui/widget';

import * as _ from 'underscore';

export
class ButtonModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            description: '',
            tooltip: '',
            disabled: false,
            icon: '',
            button_style: '',
            _view_name: 'ButtonView',
            _model_name: 'ButtonModel'
        });
    }
}

export
class ButtonPWidget extends Widget {
    static createNode(): HTMLButtonElement {
        return document.createElement('button');
    }
}

export
class ButtonView extends DOMWidgetView {
    static createPhosphorWidget(): ButtonPWidget {
        return new ButtonPWidget();
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.update_button_style();
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
                this.el.appendChild(i);
            }
            this.el.appendChild(document.createTextNode(description));
        }
        return super.update();
    }

    update_button_style() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        this.update_mapped_classes(class_map, 'button_style');
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

    el: HTMLButtonElement;
}
