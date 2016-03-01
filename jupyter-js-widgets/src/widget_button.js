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
    }),
});

var ButtonView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        var btn = document.createElement('button');
        btn.className = 'jupyter-widgets widget-button';
        this.setElement(btn);

        this.el['data-toggle'] = 'tooltip';
        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
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
        this.el['disabled'] = this.model.get('disabled');
        this.el['title'] = this.model.get('tooltip');

        var description = this.model.get('description');
        var icon = this.model.get('icon');
        if (description.trim().length === 0 && icon.trim().length === 0) {
            this.el.innerHTML = '&nbsp;'; // Preserve button height
        } else {
            this.el.innerText = description;
            if (icon.trim().length) {
                var i = document.createElement('i');
                this.el.insertBefore(i, this.el.firstChild);
                this.el.classList.add(icon);
            }
        }

        return ButtonView.__super__.update.apply(this);
    },

    update_button_style: function() {
        var class_map = {
            primary: ['widget-button-primary'],
            success: ['widget-button-success'],
            info: ['widget-button-info'],
            warning: ['widget-button-warning'],
            danger: ['widget-button-danger']
        };
        this.update_mapped_classes(class_map, 'button_style');
    },

    events: {
        // Dictionary of events and their handlers.
        'click': '_handle_click',
    },

    _handle_click: function() {
        /**
         * Handles when the button is clicked.
         */
        this.send({event: 'click'});
    },
});

module.exports = {
    ButtonView: ButtonView,
    ButtonModel: ButtonModel
};
