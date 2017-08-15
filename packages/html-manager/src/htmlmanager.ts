// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import * as outputWidgets from './output';

import * as PhosphorWidget from '@phosphor/widgets';
import { RenderMime, defaultRendererFactories } from '@jupyterlab/rendermime';

import { OutputModel, OutputView } from './output'
import { WidgetRenderer, WIDGET_MIMETYPE } from './output_renderers'

export
class HTMLManager extends base.ManagerBase<HTMLElement> {

    constructor(options?: {loader?: (moduleName: string, moduleVersion: string) => Promise<any>}) {
        super();
        this.loader = options && options.loader;
        this.renderMime = new RenderMime({
            initialFactories: defaultRendererFactories
        });
        this.renderMime.addFactory({
            safe: false,
            mimeTypes: [WIDGET_MIMETYPE],
            createRenderer: (options) => new WidgetRenderer(options, this)
        }, 0);
    }
    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options.el` argument.
     */
    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            PhosphorWidget.Widget.attach(view.pWidget, options.el);
            view.on('remove', () => {
                console.log('View removed', view);
            });
            return view;
        });
    };

    /**
     * Placeholder implementation for _get_comm_info.
     */
    _get_comm_info() {
        return Promise.resolve({});
    };

    /**
     * Placeholder implementation for _create_comm.
     */
    _create_comm(comm_target_name: string, model_id: string, data?: any, metadata?: any): Promise<any> {
        return Promise.resolve({
            on_close: () => {},
            on_msg: () => {},
            close: () => {}
        });
    };

    /**
     * Load a class and return a promise to the loaded object.
     */
    protected loadClass(className: string, moduleName: string, moduleVersion: string) {
        return new Promise((resolve, reject) => {
            if (moduleName === '@jupyter-widgets/base') {
                resolve(base);
            } else if (moduleName === '@jupyter-widgets/controls') {
                resolve(widgets);
            } else if (moduleName === '@jupyter-widgets/output') {
                resolve(outputWidgets);
            } else if (this.loader !== undefined) {
                resolve(this.loader(moduleName, moduleVersion))
            } else {
                reject(`Could not load module ${moduleName}@${moduleVersion}`);
            }
        }).then((module) => {
            if (module[className]) {
                return module[className];
            } else {
                return Promise.reject(`Class ${className} not found in module ${moduleName}@${moduleVersion}`);
            }
        });
    }

    /**
     * Renderers for contents of the output widgets
     *
     * Defines how outputs in the output widget should be rendered.
     */
    renderMime: RenderMime

    /**
     * A loader for a given module name and module version, and returns a promise to a module
     */
    loader: (moduleName: string, moduleVersion: string) => Promise<any>;
};
