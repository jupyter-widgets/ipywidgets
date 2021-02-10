// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as outputBase from '@jupyter-widgets/output';

import { DOMWidgetView, JupyterLuminoWidget } from '@jupyter-widgets/base';

import { Message } from '@lumino/messaging';

import { Panel } from '@lumino/widgets';

import { WidgetManager } from './manager';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import * as nbformat from '@jupyterlab/nbformat';

import { KernelMessage, Session } from '@jupyterlab/services';

import $ from 'jquery';

export const OUTPUT_WIDGET_VERSION = outputBase.OUTPUT_WIDGET_VERSION;

export class OutputModel extends outputBase.OutputModel {
  defaults(): Backbone.ObjectHash {
    return { ...super.defaults(), msg_id: '', outputs: [] };
  }

  initialize(attributes: any, options: any): void {
    super.initialize(attributes, options);
    // The output area model is trusted since widgets are only rendered in trusted contexts.
    this._outputs = new OutputAreaModel({ trusted: true });
    this._msgHook = (msg): boolean => {
      this.add(msg);
      return false;
    };

    this.widget_manager.context.sessionContext.kernelChanged.connect(
      (sender, args) => {
        this._handleKernelChanged(args);
      }
    );
    this.listenTo(this, 'change:msg_id', this.reset_msg_id);
    this.listenTo(this, 'change:outputs', this.setOutputs);
    this.setOutputs();
  }

  /**
   * Register a new kernel
   */
  _handleKernelChanged({
    oldValue
  }: Session.ISessionConnection.IKernelChangedArgs): void {
    const msgId = this.get('msg_id');
    if (msgId && oldValue) {
      oldValue.removeMessageHook(msgId, this._msgHook);
      this.set('msg_id', null);
    }
  }

  /**
   * Reset the message id.
   */
  reset_msg_id(): void {
    const kernel = this.widget_manager.context.sessionContext?.session?.kernel;
    const msgId = this.get('msg_id');
    const oldMsgId = this.previous('msg_id');

    // Clear any old handler.
    if (oldMsgId && kernel) {
      kernel.removeMessageHook(oldMsgId, this._msgHook);
    }

    // Register any new handler.
    if (msgId && kernel) {
      kernel.registerMessageHook(msgId, this._msgHook);
    }
  }

  add(msg: KernelMessage.IIOPubMessage): void {
    const msgType = msg.header.msg_type;
    switch (msgType) {
      case 'execute_result':
      case 'display_data':
      case 'stream':
      case 'error': {
        const model = msg.content as nbformat.IOutput;
        model.output_type = msgType as nbformat.OutputType;
        this._outputs.add(model);
        break;
      }
      case 'clear_output':
        this.clear_output((msg as KernelMessage.IClearOutputMsg).content.wait);
        break;
      default:
        break;
    }
    this.set('outputs', this._outputs.toJSON(), { newMessage: true });
    this.save_changes();
  }

  clear_output(wait = false): void {
    this._outputs.clear(wait);
  }

  get outputs(): OutputAreaModel {
    return this._outputs;
  }

  setOutputs(model?: any, value?: any, options?: any): void {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this._outputs.fromJSON(JSON.parse(JSON.stringify(this.get('outputs'))));
    }
  }

  widget_manager: WidgetManager;

  private _msgHook: (msg: KernelMessage.IIOPubMessage) => boolean;
  private _outputs: OutputAreaModel;
}

export class JupyterLuminoPanelWidget extends Panel {
  constructor(options: JupyterLuminoWidget.IOptions & Panel.IOptions) {
    const view = options.view;
    delete options.view;
    super(options);
    this._view = view;
  }

  /**
   * Process the Lumino message.
   *
   * Any custom Lumino widget used inside a Jupyter widget should override
   * the processMessage function like this.
   */
  processMessage(msg: Message): void {
    super.processMessage(msg);
    this._view.processLuminoMessage(msg);
  }

  /**
   * Dispose the widget.
   *
   * This causes the view to be destroyed as well with 'remove'
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    if (this._view) {
      this._view.remove();
    }
    this._view = null!;
  }

  private _view: DOMWidgetView;
}

export class OutputView extends outputBase.OutputView {
  _createElement(tagName: string): HTMLElement {
    this.pWidget = new JupyterLuminoPanelWidget({ view: this });
    return this.pWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.pWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }

    this.el = this.pWidget.node;
    this.$el = $(this.pWidget.node);
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this._outputView = new OutputArea({
      rendermime: this.model.widget_manager.rendermime,
      contentFactory: OutputArea.defaultContentFactory,
      model: this.model.outputs
    });
    // TODO: why is this a readonly property now?
    // this._outputView.model = this.model.outputs;
    // TODO: why is this on the model now?
    // this._outputView.trusted = true;
    this.pWidget.insertWidget(0, this._outputView);

    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-output');
    this.update(); // Set defaults.
  }

  remove(): any {
    this._outputView.dispose();
    return super.remove();
  }

  model: OutputModel;
  _outputView: OutputArea;
  pWidget: Panel;
}
