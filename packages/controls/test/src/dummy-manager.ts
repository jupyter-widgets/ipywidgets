// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '../../lib';
import * as services from '@jupyterlab/services';
import * as Backbone from 'backbone';
import * as base from '@jupyter-widgets/base';

let numComms = 0;

export
class MockComm {
    constructor() {
        this.comm_id = `mock-comm-id-${numComms}`;
        numComms += 1;
    }
    on_open(fn: Function) {
        this._on_open = fn;
    }
    on_close(fn: Function) {
        this._on_close = fn;
    }
    on_msg(fn: Function) {
        this._on_msg = fn;
    }
    _process_msg(msg: any) {
        if (this._on_msg) {
            return this._on_msg(msg);
        } else {
            return Promise.resolve();
        }
    }
    open() {
        if (this._on_open) {
            this._on_open();
        }
        return '';
    }
    close() {
        if (this._on_close) {
            this._on_close();
        }
        return '';
    }
    send() {
        return '';
    }
    comm_id: string;
    target_name: string;
    _on_msg: Function = null;
    _on_open: Function = null;
    _on_close: Function = null;
}

export
class DummyManager extends base.ManagerBase<HTMLElement> {
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
        if (moduleName === '@jupyter-widgets/controls') {
            if ((widgets as any)[className]) {
                return Promise.resolve((widgets as any)[className]);
            } else {
                return Promise.reject(`Cannot find class ${className}`);
            }
        } else if (moduleName === 'test-widgets') {
            if ((testWidgets as any)[className]) {
                return Promise.resolve((testWidgets as any)[className]);
            } else {
                return Promise.reject(`Cannot find class ${className}`);
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

class TestWidget extends base.WidgetModel {
    defaults() {
        return {...super.defaults(),
            _model_module: 'test-widgets',
            _model_name: 'TestWidget',
            _model_module_version: '1.0.0',
            _view_module: 'test-widgets',
            _view_name: 'TestWidgetView',
            _view_module_version: '1.0.0',
            _view_count: null as any,
        };
    }
}

class TestWidgetView extends base.WidgetView {
    render() {
        this._rendered += 1;
        super.render();
    }
    remove() {
        this._removed +=1;
        super.remove();
    }
    _removed = 0;
    _rendered = 0;
}

let testWidgets = {TestWidget, TestWidgetView};
