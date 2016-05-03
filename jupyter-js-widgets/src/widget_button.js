// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var _ = require('underscore');

var ButtonModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        description: '',
        tooltip: '',
        disabled: false,
        icon: '',
        button_style: '',
        _view_name: 'ButtonView',
        _model_name: 'ButtonModel'
    })
});

var ButtonView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Called when view is instantiated.
         */
        this.setElement(document.createElement('button'));
        ButtonView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.className = 'jupyter-widgets widget-button';
        this.listenTo(
            this.model,
            'change:button_style',
            this.update_button_style,
            this
        );
        this.update_button_style();
        this.update(); // Set defaults.
    },

    update: function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed. The model may have been
         * changed by another view or by a state update from the back-end.
         */
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
        return ButtonView.__super__.update.apply(this);
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

    events: {
        // Dictionary of events and their handlers.
        'click': '_handle_click'
    },

    _handle_click: function(event) {
        /**
         * Handles when the button is clicked.
         */
        event.preventDefault();
        this.send({event: 'click'});
    }
});

module.exports = {
    ButtonView: ButtonView,
    ButtonModel: ButtonModel
};
