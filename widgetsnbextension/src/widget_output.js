// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

// This widget is strongly coupled to the notebook because of the outputarea
// dependency.
var widgets = require("jupyter-js-widgets");
var _ = require("underscore");

var copyOutputs = function(value, options) {
    return JSON.parse(JSON.stringify(options.model._outputs));
}

var OutputModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend({}, widgets.DOMWidgetModel.prototype.defaults, {
        _model_name: "OutputModel",
        _view_name: "OutputView",
        msg_id: "",
        outputs: [],
    }),

    initialize: function(attributes, options) {
        OutputModel.__super__.initialize.apply(this, arguments);
        this.kernel = this.comm.kernel;
        this.listenTo(this, 'change:msg_id', this.reset_msg_id);
        if (this.kernel) {
            this.kernel.set_callbacks_for_msg(this.id, this.callbacks(), false);
        }
        this._outputs = this.get('outputs') || [];
        this.set('outputs', []);
    },

    // make callbacks
    callbacks: function() {
        return {
            iopub: {
                output: function(msg) {
                    var output = this.convert(msg);
                    this.trigger('new_message', output);
                    this._outputs.push(output);
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

    convert: function(msg) {
        // From the notebook OutputArea class
        // https://github.com/jupyter/notebook/blob/691f101b7d652866831b667b9ff92916cf0b148f/notebook/static/notebook/js/outputarea.js#L218
        var json = {};
        var msg_type = json.output_type = msg.header.msg_type;
        var content = msg.content;
        switch(msg_type) {
        case "stream" :
            json.text = content.text;
            json.name = content.name;
            break;
        case "execute_result":
            json.execution_count = content.execution_count;
        case "update_display_data":
        case "display_data":
            json.transient = content.transient;
            json.data = content.data;
            json.metadata = content.metadata;
            break;
        case "error":
            json.ename = content.ename;
            json.evalue = content.evalue;
            json.traceback = content.traceback;
            break;
        default:
            console.error("unhandled output message", msg);
            return;
        }
        return json;
}

}, {
    serializers: _.extend({
        outputs: {serialize: copyOutputs}
    }, widgets.DOMWidgetModel.serializers),
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
                // this message has been preprocessed as handle_output would
                that.output_area.append_output(msg);
            }, that);
            that.listenTo(that.model, 'clear_output', function(msg) {
                that.output_area.handle_clear_output(msg);
            })

            // Render initial contents from the current model
            that.model._outputs.forEach(function(msg) {
                that.output_area.append_output(msg);
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
