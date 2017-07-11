// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as outputBase from '@jupyter-widgets/output';

import { Panel, Widget } from '@phosphor/widgets';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import { HTMLManager } from './htmlmanager';

import * as $ from 'jquery';

import '../css/output.css';

export class OutputModel extends outputBase.OutputModel {
    defaults() {
        return {
            ...super.defaults(),
            msg_id: ''
        }
    }

    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this._outputs = new OutputAreaModel({
            values: attributes.outputs,
            // Widgets (including this output widget) are only rendered in
            // trusted contexts
            trusted: true,
        });
    }

    get outputs() {
        return this._outputs;
    }

    private _outputs: OutputAreaModel;
    widget_manager: HTMLManager;
}

export class OutputView extends outputBase.OutputView {
    _createElement(tagName: string) {
        this.pWidget = new Panel();
        return this.pWidget.node;
    }

    _setElement(el: HTMLElement) {
        if (this.el || el !== this.pWidget.node) {
            // Boxes don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }
        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node)
    }

    render() {
        const manager = this.model.widget_manager
        const rendermime = manager.renderMime;
        this._outputView = new OutputArea({
            rendermime: rendermime,
            model: this.model.outputs
        })
        this.pWidget.insertWidget(0, this._outputView);
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-output');
        this.update();
    }

    model: OutputModel;
    private _outputView: OutputArea;
    pWidget: Panel;
}
