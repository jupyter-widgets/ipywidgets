// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    IconModel, IconView
} from './widget_icon';

import {
    DescriptionView
} from './widget_description';

import {
    WidgetModel, DOMWidgetView, unpack_models
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
class BooleanGroupModel extends WidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: false,
            disabled: false,
            _model_name: 'BooleanGroupModel',
            group: null,
            selected: null,
            index: null,
            widgets: null,
            selected_widget: null
        });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.listenToGroup()
        this.on('change:index', this.sync_index)
        this.on('change:widget', () => this.find_index(this.get('widgets'), this.get('selected_widget')))
        this.on('change:selected', () => this.find_index(this.get('group'), this.get('selected')))
        this._updating = false;
    }
    listenToGroup() {
        let group = this.get('group');
        if(group) {
            group.forEach((boolWidget, widget_index) => {
                boolWidget.on('change:value', () => {
                    if(this._updating)
                        return;
                    if(boolWidget.get('value')) {
                        this.set('index', widget_index)
                    } else {
                        // if the user unselects a widget, we might just
                        // enable it again
                        this.sync_index()
                    }
                })
            })
        }
    }
    sync_index() {
        console.log('sync_index', this.cid)
        if(this._updating)
            return;
        let index = this.get('index');
        let group = this.get('group');
        let widgets = this.get('widgets');
        if(group && group.length > index) {
            if(index !== null) {
                this.set('selected', group[index]);
                this.set('last_selected', group[index]);
            } else {
                this.set('selected', null);
            }
            this._updating = true;
            try {
                group.forEach((boolWidget, widget_index) => {
                    boolWidget.set('value', index == widget_index)
                    boolWidget.save_changes()
                })
            } finally {
                this._updating = false;
            }
        }
        if(widgets && widgets.length > index) {
            if(index !== null) {
                this.set('selected_widget', widgets[index]);
                this.set('last_selected_widget', widgets[index]);
            } else {
                this.set('selected_widget', null);
            }
        }

        this.save_changes()

    }
    find_index(widget_list, widget_to_find) {
        if(!widget_list)
            return;
        let index = widget_list.indexOf(widget_to_find);
        if(index == -1)
            this.set('index', null);
        else
            this.set('index', index);

    }
    static serializers = {
        ...WidgetModel.serializers,
        group: {deserialize: unpack_models},
        selected: {deserialize: unpack_models},
        widgets: {deserialize: unpack_models},
        selected_widget: {deserialize: unpack_models}
    };
    _updating : Boolean;
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
            icon: null,
            button_style: ''
        });
    }
    static serializers = {
        ...BoolModel.serializers,
        icon: {deserialize: unpack_models},
    };
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
    async update(options?){
        if (this.model.get('value')) {
            this.el.classList.add('mod-active');
        } else {
            this.el.classList.remove('mod-active');
        }

        if (options === undefined || options.updated_view !== this) {
            this.el.disabled = this.model.get('disabled');
            this.el.setAttribute('title', this.model.get('tooltip'));

            let description = this.model.get('description');
            let icon : IconModel = this.model.get('icon');
            if(this.iconView) {
                this.iconView.remove()
                this.iconView = null;
            }
            if (description.trim().length === 0 && !icon) {
                this.el.innerHTML = '&nbsp;'; // Preserve button height
            } else {
                this.el.textContent = '';
                if (icon) {
                    this.iconView = <IconView> await this.create_child_view(icon)
                    if (description.length === 0) {
                        this.iconView.el.classList.add('center');
                    }
                    this.el.appendChild(this.iconView.el);
                    this.iconView.listenTo(icon, 'change', () => this.update())
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
    iconView: IconView;

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
