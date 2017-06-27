// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';

import * as PhosphorWidget from '@phosphor/widgets';

import { RenderMime } from '@jupyterlab/rendermime';

import { OutputModel, OutputView } from './output'
import { WidgetRenderer, WIDGET_MIMETYPE } from './output_renderers'

export
class HTMLManager extends widgets.ManagerBase<HTMLElement> {

    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options.el` argument.
     */
    display_view(msg, view, options) {
        return Promise.resolve(view).then(function(view) {
            PhosphorWidget.Widget.attach(view.pWidget, options.el);
            view.on('remove', function() {
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
    _create_comm() {
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
        return new Promise(function(resolve, reject) {
            // Shortcuts resolving the standard widgets so we don't load two
            // copies on the page. If we ever separate the widgets from the
            // base manager, we should get rid of this special case.
            if (moduleName === '@jupyter-widgets/controls') {
                resolve({ ...widgets, OutputModel, OutputView });
            } else if (moduleName === '@jupyter-widgets/base') {
                resolve(base)
            } else {
                var fallback = function(err) {
                    let failedId = err.requireModules && err.requireModules[0];
                    if (failedId) {
                        console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
                        (window as any).require([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`], resolve, reject);
                    } else {
                        throw err;
                    }
                };
                (window as any).require([`${moduleName}.js`], resolve, fallback);
            }
        }).then(function(module) {
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
    renderMime: RenderMime =
        new RenderMime({
            items: [
                { mimeType: WIDGET_MIMETYPE, renderer: new WidgetRenderer(this) },
                ...RenderMime.getDefaultItems()
            ]
        });
};
