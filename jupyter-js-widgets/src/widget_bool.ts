// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView
} from './widget';

import {
    ButtonPWidget
} from './widget_button';

import {
    Widget
} from 'phosphor-widget';

import * as _ from 'underscore';


export
class BoolModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: false,
            description: '',
            disabled: false,
            _model_name: 'BoolModel'
        });
    }
}

export
class CheckboxModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'CheckboxView',
            _model_name: 'CheckboxModel'
        });
    }
}

export
class CheckboxView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-checkbox');

        this.checkbox = document.createElement('input');
        this.checkbox.setAttribute('type', 'checkbox');
        this.el.appendChild(this.checkbox);

        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        this.update(); // Set defaults.
    }

    events(): {[e: string]: string} {
        return {
            'click input[type="checkbox"]': '_handle_click'
        }
    }

    /**
     * Handles when the checkbox is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click() {
        var value = this.model.get('value');
        this.model.set('value', !value, {updated_view: this});
        this.touch();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
        this.checkbox.checked = this.model.get('value');

        if (options === undefined || options.updated_view != this) {
            this.checkbox.disabled = this.model.get('disabled');

            var description = this.model.get('description');
            if (description.trim().length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return super.update();
    }
    checkbox: HTMLInputElement;
    label: HTMLElement;
}


export
class ToggleButtonModel extends BoolModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'ToggleButtonView',
            _model_name: 'ToggleButtonModel',
            tooltip: '',
            icon: '',
            button_style: ''
        });
    }
}

export
class ToggleButtonView extends DOMWidgetView {
    static createPhosphorWidget(): ButtonPWidget {
        return new ButtonPWidget();
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.el.className = 'jupyter-widgets widget-toggle-button';
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.update_button_style();
        this.update(); // Set defaults.
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
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?){
        if (this.model.get('value')) {
            this.el.classList.add('mod-active');
        } else {
            this.el.classList.remove('mod-active');
        }

        if (options === undefined || options.updated_view !== this) {
            this.el.disabled = this.model.get('disabled');
            this.el.setAttribute('title', this.model.get('tooltip'));

            var description = this.model.get('description');
            var icon = this.model.get('icon');
            if (description.trim().length === 0 && icon.trim().length === 0) {
                this.el.innerHTML = '&nbsp;'; // Preserve button height
            } else {
                this.el.textContent = '';
                if (icon.trim().length) {
                    var i = document.createElement('i');
                    this.el.appendChild(i);
                    i.classList.add('fa');
                    i.classList.add('fa-' + icon);
                }
                this.el.appendChild(document.createTextNode(description));
            }
        }
        return super.update();
    }

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'click': '_handle_click'
        }
    }

    /**
     * Handles and validates user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event) {
        event.preventDefault();
        var value = this.model.get('value');
        this.model.set('value', !value, {updated_view: this});
        this.touch();
    }
    el: HTMLButtonElement;
}

export
class ValidModel extends BoolModel {
    defaults() {
        return _.extend(super.defaults(), {
            readout: 'Invalid',
            _view_name: 'ValidView',
            _model_name: 'ValidModel'
        });
    }
}

export
class ValidView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-valid');
        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.el.textContent = '';
        this.el.classList.remove('mod-valid');
        this.el.classList.remove('mod-invalid');

        var icon = document.createElement('i');
        this.el.appendChild(icon);

        if (this.model.get('value')) {
            this.el.classList.add('mod-valid');
        } else {
            var readout = document.createTextNode(this.model.get('readout'));
            this.el.classList.add('mod-invalid');
            this.el.appendChild(readout);
        }
    }
}
