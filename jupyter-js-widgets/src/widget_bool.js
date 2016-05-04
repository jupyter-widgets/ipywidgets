// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var _ = require('underscore');

var BoolModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        value: false,
        description: '',
        disabled: false,
        _model_name: 'BoolModel'
    })
});

var CheckboxModel = BoolModel.extend({
    defaults: _.extend({}, BoolModel.prototype.defaults, {
        _view_name: 'CheckboxView',
        _model_name: 'CheckboxModel'
    })
});

var CheckboxView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
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
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name === 'padding' || name === 'margin') {
            this.el.style[name] = value;
        } else {
            this.checkbox.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'click input[type="checkbox"]': '_handle_click'
    },

    _handle_click: function() {
        /**
         * Handles when the checkbox is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = this.model.get('value');
        this.model.set('value', !value, {updated_view: this});
        this.touch();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed. The model may have been
         * changed by another view or by a state update from the back-end.
         */
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
        return CheckboxView.__super__.update.apply(this);
    }
});

var ToggleButtonModel = BoolModel.extend({
    defaults: _.extend({}, BoolModel.prototype.defaults, {
        _view_name: 'ToggleButtonView',
        _model_name: 'ToggleButtonModel',
        tooltip: '',
        icon: '',
        button_style: ''
    })
});

var ToggleButtonView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Called when view is instantiated.
         */
        this.setElement(document.createElement('button'));
        ToggleButtonView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.className = 'jupyter-widgets widget-toggle-button';
        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update_button_style();
        this.update(); // Set defaults.
    },

    update_button_style: function() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        this.update_mapped_classes(class_map, 'button_style');
    },

    update: function(options){
        /**
         * Update the contents of this view
         *
         * Called when the model is changed. The model may have been
         * changed by another view or by a state update from the back-end.
         */
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
        return ToggleButtonView.__super__.update.apply(this);
    },

    events: {
        // Dictionary of events and their handlers.
        'click': '_handle_click'
    },

    _handle_click: function(event) {
        /**
         * Handles and validates user input.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        event.preventDefault();
        var value = this.model.get('value');
        this.model.set('value', !value, {updated_view: this});
        this.touch();
    }
});

var ValidModel = BoolModel.extend({
    defaults: _.extend({}, BoolModel.prototype.defaults, {
        readout: 'Invalid',
        _view_name: 'ValidView',
        _model_name: 'ValidModel'
    })
});

var ValidView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-valid');
        this.update();
    },

    update: function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
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
});

module.exports = {
    BoolModel: BoolModel,
    CheckboxModel: CheckboxModel,
    CheckboxView: CheckboxView,
    ToggleButtonModel: ToggleButtonModel,
    ToggleButtonView: ToggleButtonView,
    ValidModel: ValidModel,
    ValidView: ValidView
};
