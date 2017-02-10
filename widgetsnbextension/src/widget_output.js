// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

// This widget is strongly coupled to the notebook because of the outputarea
// dependency.
var widgets = require("jupyter-js-widgets");
var _ = require("underscore");

var OutputModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend({}, widgets.DOMWidgetModel.prototype.defaults, {
        _model_name: "OutputModel",
        _view_name: "OutputView",
        msg_id: "",
    }),

    initialize: function(attributes, options) {
        OutputModel.__super__.initialize.apply(this, arguments);
        this.kernel = this.comm.kernel;
        this.listenTo(this, 'change:msg_id', this.reset_msg_id);
        console.log('initializing model');
        if (this.kernel) {
            this.kernel.set_callbacks_for_msg(this.id, this.callbacks(), false);
        }
        this._outputs = [];
    },

    // make callbacks
    callbacks: function() {
        return {
            iopub: {
                output: function(msg) {
                    this.trigger('new_message', msg);
                    this._outputs.push(msg);
                }.bind(this),
                clear_output: function(msg) {
                    this.trigger('clear_output', msg);
                    this._outputs = [];
                }.bind(this)
            }
        }
    },

    reset_msg_id: function() {
        var kernel = this.kernel;
        // Pop previous message id
        var prev_msg_id = this.previous('msg_id');
        if (prev_msg_id && kernel) {
            var previous_callback = kernel.output_callback_overrides_pop(prev_msg_id);
            if (previous_callback !== this.id) {
                console.error('Popped wrong message ('+previous_callback+' instead of '+this.id+') - likely the stack was not maintained in kernel.');
            }
        }
        var msg_id = this.get('msg_id');
        if (msg_id && kernel) {
            kernel.output_callback_overrides_push(msg_id, this.id);
        }
    },

});

var OutputView = widgets.DOMWidgetView.extend({

    initialize: function (parameters) {
        OutputView.__super__.initialize.apply(this, arguments);
    },

    render: function(){
        var that = this;
        var renderOutput = function(outputArea) {
            that.output_area = new outputArea.OutputArea({
                selector: that.el,
                config: that.options.cell.config,
                prompt_area: false,
                events: that.model.widget_manager.notebook.events,
                keyboard_manager: that.model.widget_manager.keyboard_manager });
            that.listenTo(that.model, 'new_message', function(msg) {
                console.log('View new output message');
                console.log(msg);
                that.output_area.handle_output(msg);
            }, that);
            that.listenTo(that.model, 'clear_output', function(msg) {
                console.log('View clear output');
                console.log(msg);
                that.output_area.handle_clear_output(msg);
            })

            // Render initial contents from that.model._outputs
            that.model._outputs.forEach(function(msg) {
                that.output_area.handle_output(msg);
            }, that)
        }

        if (requirejs.defined("notebook/js/outputarea")) {
            // Notebook 4.x
            requirejs(["notebook/js/outputarea"], renderOutput)
        } else {
            // Notebook 5.x
            requirejs(["notebook"], function(notebookApp) {
                var outputArea = notebookApp["notebook/js/outputarea"];
                renderOutput(outputArea);
            });
        }
    },
});

module.exports = {
    OutputView: OutputView,
    OutputModel: OutputModel,
};
