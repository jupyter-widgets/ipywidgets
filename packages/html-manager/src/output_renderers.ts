// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget, Panel } from '@phosphor/widgets';

import { IRenderMime, RenderMime } from '@jupyterlab/rendermime';

import { HTMLManager } from './htmlmanager';

export const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

// Renderer to allow the output widget to render sub-widgets
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
