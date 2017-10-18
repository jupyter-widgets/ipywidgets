import * as controls from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Kernel, KernelMessage
} from '@jupyterlab/services';

import {
    HTMLManager
} from '@jupyter-widgets/html-manager';

import './widgets.css';

export interface CustomWindow extends Window {
    // TODO(cnishina): Need help to return type of require.
    require: (modluleArray: string[], resolve: Function, reject: Function) => any;
}

let requirePromise = function(module: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if ((window as CustomWindow).require === void 0) {
            reject('requirejs not loaded');
        }
        (window as CustomWindow).require([module], resolve, reject);
    });
}

export
class WidgetManager extends HTMLManager {
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

    // TODO(cnishina): what is options? It is not used in this method.
    display_view(msg: KernelMessage.IMessage, view: base.DOMWidgetView, options: any): Promise<base.DOMWidgetView> {
        return Promise.resolve(view).then((view) => {
            pWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', () => {
                console.log('view removed', view);
            });
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
    _get_comm_info(): Promise<{[key: string]: string}> {
        return this.kernel.requestCommInfo({target: this.comm_target_name}).then(reply => reply.content.comms);
    }

    kernel: Kernel.IKernelConnection;
    el: HTMLElement;
    _commRegistration: IDisposable;
}
