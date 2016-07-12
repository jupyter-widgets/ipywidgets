// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView
} from 'jupyter-js-widgets';

import {
  IDisposable
} from 'phosphor-disposable';

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

/**
 * Output widget:
 *
 * Model has the msg_id to listen for. The *model*, on change of msg_id, registers a hook for that message id. The hook stores the output message in the model's message list with a unique id and returns false to halt other processing of that output message. The hook also maybe changes the 'current change' index???
 *
 * The view is notified of changes to the output message queue (how?). Perhaps we finally use backbone collections? Perhaps we trigger a single update of the output index that changed/added (maybe -1 if the output was cleared?). The view the renders the appropriate output index and updates the widget appropriately.
 *
 * OR the view is a wrapper around an OutputWidget, and just feeds it the list??
 *
 * The *view* merely renders whatever output messages it sees. Should it use the output area widget, or just the output renderer??? My guess is just the output renderer. It tries to be smart about not rerendering output that it has already renderered.
 */


/**
 * We end up transmitting output messages twice - once through the output system, and then once again back through the widget system. Perhaps we shouldn't store the messages in the normal data that is synced back to the kernel, but it would be saved???
 *
 * actually, it's not made for very output intensive things, so maybe we can try it out for a bit. Adapt if it becomes a problem...
 */

/**
 * The output widget needs to depend on the thing that is installed. Maybe we should go back to the concept of registering a package.
 */


// how is the output model going to get a handle on the kernel?
// how is the view going to get a handle on the rendermime instance?
// how is the widget manager know to instantiate an output model/renderer with those particular options,
// but not other widgets with similar options?
export
class OutputModel extends DOMWidgetModel {
  defaults() {
    return _.extend(super.defaults(), {
      _model_name: 'OutputModel',
      _view_name: 'OutputView',
      msg_id: ''
    });
  }

  initialize() {
    this.listenTo(this, 'change:msg_id', this.reset_msg_id);
    this.widget_manager.context.kernelChanged.connect((sender, kernel) => {
      this._msgHook.dispose();
    });
    this.reset_msg_id();
  }

  reset_msg_id() {
    this.clear_output();
    if (this._msgHook) {
      this._msgHook.dispose();
    }
    this._msgHook = null;

    let kernel = this.widget_manager.context.kernel;
    let msgId = this.get('msg_id');
    if (msgId && kernel) {
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

  clear_output() {
    this._outputs.clear();
  }

  widget_manager: WidgetManager;

  private _msgHook: IDisposable = null;
  private _outputs = new OutputAreaModel();
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
