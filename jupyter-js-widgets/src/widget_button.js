// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var widget = require("./widget");
var $ = require("./jquery");
var _ = require("underscore");

var ButtonModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        description: "",
        tooltip: "",
        disabled: false,
        icon: "",
        button_style: "",
        _view_name: "ButtonView",
        _model_name: "ButtonModel"
    }),
});

var ButtonView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.setElement($("<button />")
            .addClass('jupyter-widgets widget-button btn btn-default'));
        this.$el.attr("data-toggle", "tooltip");
        this.listenTo(this.model, "change:button_style", this.update_button_style, this);
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
        this.$el.prop("disabled", this.model.get("disabled"));
        this.$el.attr("title", this.model.get("tooltip"));

        var description = this.model.get("description");
        var icon = this.model.get("icon");
        if (description.trim().length === 0 && icon.trim().length ===0) {
            this.$el.html("&nbsp;"); // Preserve button height
        } else {
            this.$el.text(description);
            $('<i class="fa"></i>').prependTo(this.$el).addClass(icon);
        }

        return ButtonView.__super__.update.apply(this);
    },

    update_button_style: function() {
        var class_map = {
            primary: ['btn-primary'],
            success: ['btn-success'],
            info: ['btn-info'],
            warning: ['btn-warning'],
            danger: ['btn-danger']
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
