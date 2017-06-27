import * as base from '@jupyter-widgets/base';
import * as controls from '@jupyter-widgets/controls';

import './widgets.css';
import * as PWidget from '@phosphor/widgets';

export
class WidgetManager extends base.ManagerBase<HTMLElement> {
    constructor(kernel, el) {
        super();
        this.kernel = kernel;
        this.el = el;

        // Create a comm manager shim
        this.commManager = new base.shims.services.CommManager(kernel);

        // Register the comm target
        this.commManager.register_target(this.comm_target_name, this.handle_comm_open.bind(this));
    }

    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            PWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    /**
     * Load a class and return a promise to the loaded object.
     */
    protected loadClass(className: string, moduleName: string, moduleVersion: string) {
        return new Promise(function(resolve, reject) {
            // Shortcuts resolving the standard widgets so we don't load two
            // copies on the page. If we ever separate the widgets from the
            // base manager, we should get rid of this special case.
            if (moduleName === '@jupyter-widgets/controls') {
                resolve(controls);
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

    _create_comm(targetName, id, metadata) {
        return this.commManager.new_comm(targetName, metadata, id);
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    kernel: any;
    el: HTMLElement;
    commManager: any;
}
