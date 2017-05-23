// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    ManagerBase
} from '../lib/manager-base';

import * as PhosphorWidget from '@phosphor/widgets';

import * as widgets from '../../jupyter-js-widgets/lib/index';

import {
    OutputModel, OutputView
} from './output'

export
class EmbedManager extends ManagerBase<HTMLElement> {

    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options` argument.
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
            if (moduleName === 'jupyter-js-widgets') {
                // Shortcut resolving the standard widgets so we don't load two
                // copies on the page. If we ever separate the embed manager
                // from the main widget package, we should get rid of this special
                // case.
                resolve({ ...widgets, OutputModel, OutputView });
            } else {
                var fallback = function(err) {
                    (window as any).require([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`], resolve, reject);
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
};
