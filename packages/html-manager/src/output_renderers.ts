// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget, Panel, PanelLayout } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { HTMLManager } from './htmlmanager';

export const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

// Renderer to allow the output widget to render sub-widgets
export class WidgetRenderer extends Widget implements IRenderMime.IRenderer {
    constructor(options: IRenderMime.IRendererOptions, manager: HTMLManager) {
        super();
        this.mimeType = options.mimeType;
        this._manager = manager;
        this.layout = new PanelLayout();
    }

    async renderModel(model: IRenderMime.IMimeModel) {
        const source: any = model.data[this.mimeType];
        const modelPromise = this._manager.get_model(source.model_id);
        if (modelPromise) {
            try {
                // We don't call 'display_model' or 'display_view' because we
                // want to preserve the Phosphor parent/child relationship. This
                // is consistent with display_model/view as long as they only
                // attach the widget to the DOM.
                let wModel = await modelPromise;
                let view = await this._manager.create_view(wModel);
                let layout = this.layout as PanelLayout;
                layout.addWidget(view.pWidget);
            } catch (err) {
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
