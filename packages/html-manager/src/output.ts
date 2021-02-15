// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as outputBase from '@jupyter-widgets/output';

import { Panel } from '@lumino/widgets';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import { HTMLManager } from './htmlmanager';

import $ from 'jquery';

import '../css/output.css';

export class OutputModel extends outputBase.OutputModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      msg_id: ''
    };
  }

  initialize(attributes: any, options: any): void {
    super.initialize(attributes, options);
    this._outputs = new OutputAreaModel({
      values: attributes.outputs,
      // Widgets (including this output widget) are only rendered in
      // trusted contexts
      trusted: true
    });
  }

  get outputs(): OutputAreaModel {
    return this._outputs;
  }

  private _outputs: OutputAreaModel;
  widget_manager: HTMLManager;
}

export class OutputView extends outputBase.OutputView {
  _createElement(tagName: string): HTMLElement {
    this.lmWidget = new Panel();
    return this.lmWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.lmWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }
    this.el = this.lmWidget.node;
    this.$el = $(this.lmWidget.node);
  }

  render(): void {
    const manager = this.model.widget_manager;
    const rendermime = manager.renderMime;
    this._outputView = new OutputArea({
      rendermime: rendermime,
      model: this.model.outputs
    });
    this.lmWidget.insertWidget(0, this._outputView);
    this.lmWidget.addClass('jupyter-widgets');
    this.lmWidget.addClass('widget-output');
    this.update();
  }

  model: OutputModel;
  private _outputView: OutputArea;
  lmWidget: Panel;
}
