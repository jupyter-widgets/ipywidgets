import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Kernel
} from '@jupyterlab/services';

import {
    HTMLManager
} from '@jupyter-widgets/html-manager';

import {
    RenderMime
  } from '@jupyterlab/rendermime';

import './widgets.css';

let requirePromise = function(module: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if ((window as any).require === void 0) {
            reject('requirejs not loaded');
        }
        (window as any).require([module], resolve, reject);
    });
};

// TODO: don't use html manager - instead use the jupyterlab manager, which
// returns a phosphor widget, since we will be rendering things using the
// rendermime.

export
class WidgetManager extends HTMLManager {
    constructor(options: WidgetManager.IOptions) {
        super({ loader: options.loader });
        this.kernel = options.kernel;
        this.rendermime = options.rendermime;
        this.newKernel(this.kernel);
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
    }

    display_view(msg, view: base.DOMWidgetView, options) {
        return Promise.resolve(view).then((view) => {
            pWidget.Widget.attach(view.pWidget, this.el);
            return view;
        });
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
    rendermime: RenderMime;
    _commRegistration: IDisposable;
}

/**
 * The namespace for the `HTMLManager` class statics.
 */
export
namespace WidgetManager {
    /**
     * The options for the constructor.
     */
    export
    interface IOptions extends HTMLManager.IOptions {
        /**
         * The kernel connection.
         */
        kernel: Kernel.IKernelConnection;

        rendermime: RenderMime;
    }
}
