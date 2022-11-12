// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

// This widget is strongly coupled to the notebook because of the outputarea
// dependency.
var outputBase = require('@jupyter-widgets/output');
require('./widget_output.css');

var outputArea = new Promise(function (resolve, reject) {
  requirejs(['notebook/js/outputarea'], resolve, reject);
});

export class OutputModel extends outputBase.OutputModel {
  defaults() {
    return {
      ...super.defaults(),
      msg_id: '',
      outputs: [],
    };
  }

  initialize(attributes, options) {
    super.initialize(attributes, options);
    this.listenTo(this, 'change:msg_id', this.reset_msg_id);

    if (this.comm && this.comm.kernel) {
      this.kernel = this.comm.kernel;
      this.kernel.set_callbacks_for_msg(this.model_id, this.callbacks(), false);
    }

    var that = this;
    // Create an output area to handle the data model part
    outputArea.then(function (outputArea) {
      that.output_area = new outputArea.OutputArea({
        selector: document.createElement('div'),
        config: { data: { OutputArea: {} } },
        prompt_area: false,
        events: that.widget_manager.notebook.events,
        keyboard_manager: that.widget_manager.keyboard_manager,
      });
      that.listenTo(
        that,
        'new_message',
        function (msg) {
          that.output_area.handle_output(msg);
          that.set('outputs', that.output_area.toJSON(), { newMessage: true });
          that.save_changes();
        },
        that
      );
      that.listenTo(that, 'clear_output', function (msg) {
        that.output_area.handle_clear_output(msg);
        that.set('outputs', that.output_area.toJSON(), { newMessage: true });
        that.save_changes();
      });
      that.listenTo(that, 'change:outputs', that.setOutputs);
      that.setOutputs();
    });
  }

  // make callbacks
  callbacks() {
    // Merge our callbacks with the base class callbacks.
    var cb = super.callbacks();
    var iopub = cb.iopub || {};
    var iopubCallbacks = {
      ...iopub,
      output: function (msg) {
        this.trigger('new_message', msg);
        if (iopub.output) {
          iopub.output.apply(this, arguments);
        }
      }.bind(this),
      clear_output: function (msg) {
        this.trigger('clear_output', msg);
        if (iopub.clear_output) {
          iopub.clear_output.apply(this, arguments);
        }
      }.bind(this),
    };
    return { ...cb, iopub: iopubCallbacks };
  }

  reset_msg_id() {
    var kernel = this.kernel;
    // Pop previous message id
    var prev_msg_id = this.previous('msg_id');
    if (prev_msg_id && kernel) {
      var previous_callback = kernel.output_callback_overrides_pop(prev_msg_id);
      if (previous_callback !== this.model_id) {
        console.error(
          'Popped wrong message (' +
            previous_callback +
            ' instead of ' +
            this.model_id +
            ') - likely the stack was not maintained in kernel.'
        );
      }
    }
    var msg_id = this.get('msg_id');
    if (msg_id && kernel) {
      kernel.output_callback_overrides_push(msg_id, this.model_id);
    }
  }

  setOutputs(model, value, options) {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.output_area.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this.output_area.fromJSON(
        JSON.parse(JSON.stringify(this.get('outputs')))
      );
    }
  }
}

export class OutputView extends outputBase.OutputView {
  render() {
    var that = this;
    this.el.classList.add('jupyter-widgets-output-area');
    outputArea.then(function (outputArea) {
      that.output_area = new outputArea.OutputArea({
        selector: that.el,
        // use default values for the output area config
        config: { data: { OutputArea: {} } },
        prompt_area: false,
        events: that.model.widget_manager.notebook.events,
        keyboard_manager: that.model.widget_manager.keyboard_manager,
      });
      that.listenTo(
        that.model,
        'new_message',
        function (msg) {
          that.output_area.handle_output(msg);
        },
        that
      );
      that.listenTo(that.model, 'clear_output', function (msg) {
        that.output_area.handle_clear_output(msg);
        // fake the event on the output area element. This can be
        // deleted when we can rely on
        // https://github.com/jupyter/notebook/pull/2411 being
        // available.
        that.output_area.element.trigger('clearing', { output_area: this });
      });
      // Render initial contents from the current model
      that.listenTo(that.model, 'change:outputs', that.setOutputs);
      that.setOutputs();
    });
    super.render();
  }

  setOutputs(model, value, options) {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.output_area.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this.output_area.fromJSON(
        JSON.parse(JSON.stringify(this.model.get('outputs')))
      );
    }
  }
}
