// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
    ManagerBase
} from '../../lib';
import * as services from '@jupyterlab/services';
import * as Backbone from 'backbone';

export
class MockComm {
    on_close() {}
    on_msg() {}
    close() {}
}

export
class DummyManager extends ManagerBase<HTMLElement> {
    constructor() {
        super();
        this.el = window.document.createElement('div');
    }
    
    display_view(msg: services.KernelMessage.IMessage, view: Backbone.View<Backbone.Model>, options: any) {
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', () => console.log('view removed', view));
            return view.el;
        });
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    _create_comm() {
        return Promise.resolve(new MockComm());
    }

    el: HTMLElement;
}
