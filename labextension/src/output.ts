// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView
} from 'jupyter-js-widgets';

import {
  IDisposable
} from 'phosphor/lib/core/disposable';

import {
  WidgetManager
} from './index';

import {
  OutputAreaModel, OutputAreaWidget
} from 'jupyterlab/lib/notebook/output-area';

import {
  nbformat
} from 'jupyterlab/lib/notebook/notebook/nbformat';

import {
  KernelMessage
} from 'jupyter-js-services';

import * as _ from 'underscore';


export
class OutputModel extends DOMWidgetModel {
  defaults() {
    return _.extend(super.defaults(), {
      _model_name: 'OutputModel',
      _view_name: 'OutputView',
      msg_id: ''
    });
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options)
    this._outputs = new OutputAreaModel();
    this.listenTo(this, 'change:msg_id', this.reset_msg_id);
    this.widget_manager.context.kernelChanged.connect((sender, kernel) => {
      this._msgHook.dispose();
    });
    this.reset_msg_id();
  }

  reset_msg_id() {
    if (this._msgHook) {
      this._msgHook.dispose();
    }
    this._msgHook = null;

    let kernel = this.widget_manager.context.kernel;
    let msgId = this.get('msg_id');
    if (msgId && kernel) {
      this.clear_output(true);
      this._msgHook = kernel.registerMessageHook(this.get('msg_id'), msg => {
        this.add(msg);
        return false;
      });
    }
  }

  add(msg: KernelMessage.IIOPubMessage) {
    let msgType = msg.header.msg_type as nbformat.OutputType;
    switch (msgType) {
    case 'execute_result':
    case 'display_data':
    case 'stream':
    case 'error':
      let model = msg.content as nbformat.IOutput;
      model.output_type = msgType;
      this._outputs.add(model);
      break;
    default:
      break;
    }
  }

  clear_output(wait: boolean = false) {
    this._outputs.clear(wait);
  }

  get outputs() {
    return this._outputs;
  }
  widget_manager: WidgetManager;

  private _msgHook: IDisposable = null;
  private _outputs: OutputAreaModel;
}


export
class OutputView extends DOMWidgetView {
  /**
   * Called when view is rendered.
   */
  render() {
    this._outputView = new OutputAreaWidget({
      rendermime: this.model.widget_manager.rendermime
    });
    this._outputView.model = this.model.outputs;
    this._outputView.trusted = true;

    this.setElement(this._outputView.node);
    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-output');
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update() {
    return super.update();
  }

  remove() {
    this._outputView.dispose();
    return super.remove();
  }

  model: OutputModel;
  _outputView: OutputAreaWidget;
}
