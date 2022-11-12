// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as outputBase from '@jupyter-widgets/output';

import { JupyterLuminoPanelWidget } from '@jupyter-widgets/base';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import { HTMLManager } from './htmlmanager';

import $ from 'jquery';

import '../css/output.css';

export class OutputModel extends outputBase.OutputModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      msg_id: '',
      outputs: [],
    };
  }

  initialize(attributes: any, options: any): void {
    super.initialize(attributes, options);
    this._outputs = new OutputAreaModel({ trusted: true });
    this.listenTo(this, 'change:outputs', this.setOutputs);
    this.setOutputs();
  }

  get outputs(): OutputAreaModel {
    return this._outputs;
  }

  clear_output(wait = false): void {
    this._outputs.clear(wait);
  }

  setOutputs(model?: any, value?: any, options?: any): void {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this._outputs.fromJSON(JSON.parse(JSON.stringify(this.get('outputs'))));
    }
  }

  private _outputs: OutputAreaModel;
  widget_manager: HTMLManager;
}

export class OutputView extends outputBase.OutputView {
  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoPanelWidget({ view: this });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }
    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  render(): void {
    super.render();
    this._outputView = new OutputArea({
      rendermime: this.model.widget_manager.renderMime,
      model: this.model.outputs,
    });
    this.luminoWidget.insertWidget(0, this._outputView);
    this.luminoWidget.addClass('jupyter-widgets');
    this.luminoWidget.addClass('widget-output');
    this.update();
  }

  remove(): any {
    this._outputView.dispose();
    return super.remove();
  }

  model: OutputModel;
  private _outputView: OutputArea;
  luminoWidget: JupyterLuminoPanelWidget;
}
