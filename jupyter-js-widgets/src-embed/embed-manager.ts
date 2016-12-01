// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    ManagerBase
} from '../lib/manager-base';

export
class EmbedManager extends ManagerBase<HTMLElement> {

    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options` argument.
     */
    display_view(msg, view, options) {
        return Promise.resolve(view).then(function(view) {
            options.el.appendChild(view.el);
            view.trigger('displayed');
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
     * Takes a requirejs success handler and returns a requirejs error handler
     * that attempts loading the module from unpkg.
     */
    require_error(success_callback, version : string) {
        return function(err) : any {
            var failedId = err.requireModules && err.requireModules[0];
            if (failedId) {
                // TODO: Get typing to work for requirejs
                (window as any).require(['https://unpkg.com/' + failedId + '@' + version + '/dist/index.js'], success_callback);
            } else {
                throw err;
            }
        };
    }
};
