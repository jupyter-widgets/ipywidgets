import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import {
  Kernel
} from '@jupyterlab/services';

import {
    HTMLManager
} from '@jupyter-widgets/html-manager';

import './widgets.css';

export
class WidgetManager extends HTMLManager {
    constructor(kernel: Kernel.IKernelConnection, el: HTMLElement) {
        super();
        this.kernel = kernel;
        this.el = el;

        kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
            let oldComm = new base.shims.services.Comm(comm);
            await this.handle_comm_open(oldComm, msg);
        });
    }

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
     * Create a comm.
     */
    async _create_comm(target_name: string, model_id: string, data?: any, metadata?: any): Promise<base.shims.services.Comm> {
            let comm = await this.kernel.connectToComm(target_name, model_id);
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
}
