// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    DescriptionView
} from './widget_description';

import {
    DOMWidgetView
} from '@jupyter-widgets/base';

import * as _ from 'underscore';


export
class BoolModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: false,
            disabled: false,
            _model_name: 'BoolModel'
        });
    }
}

export
class CheckboxModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            indent: true,
            _view_name: 'CheckboxView',
            _model_name: 'CheckboxModel'
        });
    }
}

export
class CheckboxView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-checkbox');

        // adding a zero-width space to the label to help
        // the browser set the baseline correctly
        this.label.innerHTML = '&#8203;';

        // label containing the checkbox and description span
        this.checkboxLabel = document.createElement('label');
        this.checkboxLabel.classList.add('widget-label-basic');
        this.el.appendChild(this.checkboxLabel);

        // checkbox
        this.checkbox = document.createElement('input');
        this.checkbox.setAttribute('type', 'checkbox');
        this.checkboxLabel.appendChild(this.checkbox);

        // span to the right of the checkbox that will render the description
        this.descriptionSpan = document.createElement('span');
        this.checkboxLabel.appendChild(this.descriptionSpan);

        this.listenTo(this.model, 'change:indent', this.updateIndent);

        this.update(); // Set defaults.
        this.updateDescription();
        this.updateIndent();
    }

    /**
     * Overriden from super class
     *
     * Update the description span (rather than the label) since
     * we want the description to the right of the checkbox.
     */
    updateDescription() {
        // can be called before the view is fully initialized
        if (this.checkboxLabel == null) {
            return;
        }
        let description = this.model.get('description');
        this.descriptionSpan.innerHTML = description;
        this.typeset(this.descriptionSpan);
        this.descriptionSpan.title = description;
        this.checkbox.title = description;
    }

    /**
     * Update the visibility of the label in the super class
     * to provide the optional indent.
     */
    updateIndent() {
        let indent = this.model.get('indent');
        this.label.style.display = indent ? '' : 'none';
    }

    events(): {[e: string]: string} {
        return {
            'click input[type="checkbox"]': '_handle_click'
        };
    }

    /**
     * Handles when the checkbox is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click() {
        let value = this.model.get('value');
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
        }
        return super.update();
    }

    checkbox: HTMLInputElement;
    checkboxLabel: HTMLLabelElement;
    descriptionSpan: HTMLSpanElement;
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
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('jupyter-button');
        this.el.classList.add('widget-toggle-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    }

    update_button_style() {
        this.update_mapped_classes(ToggleButtonView.class_map, 'button_style');
    }

    set_button_style() {
        this.set_mapped_classes(ToggleButtonView.class_map, 'button_style');
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

            let description = this.model.get('description');
            let icon = this.model.get('icon');
            if (description.trim().length === 0 && icon.trim().length === 0) {
                this.el.innerHTML = '&nbsp;'; // Preserve button height
            } else {
                this.el.textContent = '';
                if (icon.trim().length) {
                    let i = document.createElement('i');
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
        };
    }

    /**
     * Handles and validates user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event) {
        event.preventDefault();
        let value = this.model.get('value');
        this.model.set('value', !value, {updated_view: this});
        this.touch();
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
class ValidView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-valid');
        this.el.classList.add('widget-inline-hbox');
        let icon = document.createElement('i');
        this.el.appendChild(icon);
        this.readout = document.createElement('span');
        this.readout.classList.add('widget-valid-readout');
        this.readout.classList.add('widget-readout');
        this.el.appendChild(this.readout);
        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.el.classList.remove('mod-valid');
        this.el.classList.remove('mod-invalid');
        this.readout.textContent = this.model.get('readout');
        if (this.model.get('value')) {
            this.el.classList.add('mod-valid');
        } else {
            this.el.classList.add('mod-invalid');
        }
    }
    readout: HTMLSpanElement;
}
