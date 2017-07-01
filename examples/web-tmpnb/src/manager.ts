import * as controls from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Kernel
} from '@jupyterlab/services';

import '@jupyter-widgets/controls/css/widgets.css';

let requirePromise = function(module: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if ((window as any).require === void 0) {
            reject('requirejs not loaded');
        }
        (window as any).require([module], resolve, reject);
    });
}

export
class WidgetManager extends base.ManagerBase<HTMLElement> {
    constructor(kernel: Kernel.IKernelConnection, el: HTMLElement) {
        super();
        this.kernel = kernel;
        this.newKernel(kernel);
        this.el = el;
    }

    newKernel(kernel: Kernel.IKernelConnection) {
        if (this._commRegistration) {
            this._commRegistration.dispose();
        }
        if (!kernel) {
            return;
        }
        this._commRegistration = kernel.registerCommTarget(this.comm_target_name,
        (comm, msg) => {
            this.handle_comm_open(new base.shims.services.Comm(comm), msg);
        });
    };

    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            pWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    /**
     * Load a class and return a promise to the loaded object.
     */
    protected async loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
        let module: any;
        if (moduleName === '@jupyter-widgets/controls') {
            module = controls;
        } else if (moduleName === '@jupyter-widgets/base') {
            module = base;
        } else {
            try {
                module = await requirePromise(`${moduleName}.js`);
            } catch(err) {
                let failedId = err.requireModules && err.requireModules[0];
                if (failedId) {
                    console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
                    module = await requirePromise(`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`);
                } else {
                    throw err;
                }
            }
        }

        if (module[className] === void 0) {
            throw new Error(`Class ${className} not found in module ${moduleName}@${moduleVersion}`);
        }
        return module[className];
    }

    /**
     * Create a comm.
     */
    _create_comm(target_name: string, model_id: string, data?: any, metadata?: any): Promise<base.shims.services.Comm> {
            let comm = this.kernel.connectToComm(target_name, model_id);
            if (data || metadata) {
                comm.open(data, metadata);
            }
            return Promise.resolve(new base.shims.services.Comm(comm));
        }

    /**
     * Get the currently-registered comms.
     */
    _get_comm_info(): Promise<any> {
        return this.kernel.requestCommInfo({target: this.comm_target_name}).then(reply => reply.content.comms);
    }

    kernel: Kernel.IKernelConnection;
    el: HTMLElement;
    _commRegistration: IDisposable;
}
