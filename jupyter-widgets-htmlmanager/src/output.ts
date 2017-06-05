// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetModel, DOMWidgetView } from '@jupyter-widgets/controls';

import { Panel, Widget } from '@phosphor/widgets';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import { IRenderMime, RenderMime } from '@jupyterlab/rendermime';

import { HTMLManager } from './htmlmanager';

import * as $ from 'jquery';

import '../css/output.css';

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

export class WidgetRenderer implements RenderMime.IRenderer {
    constructor(widget_manager: HTMLManager) {
        this._manager = widget_manager;
    }

    canRender(options: RenderMime.IRenderOptions): boolean {
        const source: any = options.model.data.get(options.mimeType);
        const model = this._manager.get_model(source.model_id);
        return model !== void 0;
    }

    wouldSanitize(options: RenderMime.IRenderOptions): boolean {
        return false;
    }

    render(options: RenderMime.IRenderOptions) {
        const widget = new Panel();
        const source: any = options.model.data.get(options.mimeType);
        const model = this._manager.get_model(source.model_id);
        console.log(model);
        if (model) {
            model.then((model: any) => {
                return this._manager.display_model(null, model, {
                    el: widget.node
                })
            }).catch((error) => {
                console.log('Error creating widget.')
                console.log(error);
                const node = document.createElement('p')
                node.textContent = 'Error creating widget.'
                widget.addWidget(new Widget({node}))
            })
        } else {
            const node = document.createElement('p')
            node.textContent = 'Error creating widget.'
            widget.addWidget(new Widget({node}))
        }
        return widget;
    }

    private _manager: HTMLManager;
    public mimeTypes = [WIDGET_MIMETYPE];
}


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
    widget_manager: HTMLManager;
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
        const rendermime = new RenderMime({items: RenderMime.getDefaultItems()})
        rendermime.addRenderer({
            mimeType: WIDGET_MIMETYPE,
            renderer: new WidgetRenderer(this.model.widget_manager)
        });
        this._outputView = new OutputArea({
            rendermime: rendermime,
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
