// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '../../lib';
import * as services from '@jupyterlab/services';
import * as Backbone from 'backbone';

import * as sinon from 'sinon';

export
class MockComm {
    // Somehow the mock comm should trigger a close event?
    on_close(fn) {
        this._on_close = fn;
    };
    on_msg() {};
    close() {
        if (this._on_close) {
            this._on_close();
        }
        console.error(this._on_close);
    };
    send() {};
    comm_id = 'mock-comm-id';
    _on_close: Function = null;
}

export
class DummyManager extends widgets.ManagerBase<HTMLElement> {
    constructor() {
        super();
        this.el = window.document.createElement('div');
    }
    
    display_view(msg: services.KernelMessage.IMessage, view: Backbone.View<Backbone.Model>, options: any) {
        // TODO: make this a spy
        // TODO: return an html element
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', () => console.log('view removed', view));
            return view.el;
        });
    }

    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
        if (moduleName === 'jupyter-js-widgets') {
            if (widgets[className]) {
                return Promise.resolve(widgets[className]);
            } else {
                return Promise.reject(`Cannot find class ${className}`)
            }
        } else {
            return Promise.reject(`Cannot find module ${moduleName}`);
        }
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    _create_comm() {
        return Promise.resolve(new MockComm());
    }

    el: HTMLElement;
}
