// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget, Panel } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { HTMLManager } from './htmlmanager';

export const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

// Renderer to allow the output widget to render sub-widgets
export class WidgetRenderer extends Widget implements IRenderMime.IRenderer {
    constructor(options: IRenderMime.IRendererOptions, manager: HTMLManager) {
        super();
        this.mimeType = options.mimeType;
        this._manager = manager;
    }

    async renderModel(model: IRenderMime.IMimeModel) {
        const source: any = model.data[this.mimeType];
        const modelPromise = this._manager.get_model(source.model_id);
        if (modelPromise) {
            try {
                let wModel = await modelPromise;
                await this._manager.display_model(null, wModel, {el: this.node});
            } catch(err) {
                console.log('Error displaying widget');
                console.log(err);
                this.node.textContent = 'Error displaying widget';
            }
        } else {
            this.node.textContent = 'Error creating widget: could not find model';
            return Promise.resolve();
        }
    }

    /**
     * The mimetype being rendered.
     */
    readonly mimeType: string;
    private _manager: HTMLManager;
}
