// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView
} from '../../jupyter-js-widgets';

import {
    Panel, Widget
} from '@phosphor/widgets';

import {
    OutputAreaModel, OutputArea
} from '@jupyterlab/outputarea';

import {
    IRenderMime, RenderMime
} from '@jupyterlab/rendermime';

import {
  EmbedManager
} from './embed-manager';


import * as $ from 'jquery';

export class OutputModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'OutputModel',
            _view_name: 'OutputView',
            msg_id: ''
        }
    }

    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this._outputs = new OutputAreaModel({
            values: attributes.outputs
        });
    }

    get outputs() {
        return this._outputs;
    }

    private _outputs: OutputAreaModel;
    widget_manager: EmbedManager;
}

export class OutputView extends DOMWidgetView {
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
        this._outputView = new OutputArea({
            rendermime: new RenderMime({items: RenderMime.getDefaultItems()}),
            contentFactory: OutputArea.defaultContentFactory,
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
