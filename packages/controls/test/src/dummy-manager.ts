// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '../../lib';
import * as Backbone from 'backbone';
import * as base from '@jupyter-widgets/base';
import { WidgetModel, WidgetView } from '@jupyter-widgets/base';
import { ManagerBase } from '@jupyter-widgets/base-manager';

let numComms = 0;

export class MockComm {
  constructor() {
    this.comm_id = `mock-comm-id-${numComms}`;
    numComms += 1;
  }
  on_open(fn: Function): void {
    this._on_open = fn;
  }
  on_close(fn: Function): void {
    this._on_close = fn;
  }
  on_msg(fn: Function): void {
    this._on_msg = fn;
  }
  _process_msg(msg: any): any {
    if (this._on_msg) {
      return this._on_msg(msg);
    } else {
      return Promise.resolve();
    }
  }
  open(): string {
    if (this._on_open) {
      this._on_open();
    }
    return '';
  }
  close(): string {
    if (this._on_close) {
      this._on_close();
    }
    return '';
  }
  send(): string {
    return '';
  }
  comm_id: string;
  target_name: string;
  _on_msg: Function | null = null;
  _on_open: Function | null = null;
  _on_close: Function | null = null;
}

class TestWidget extends base.WidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_module: 'test-widgets',
      _model_name: 'TestWidget',
      _model_module_version: '1.0.0',
      _view_module: 'test-widgets',
      _view_name: 'TestWidgetView',
      _view_module_version: '1.0.0',
      _view_count: null as any
    };
  }
}

class TestWidgetView extends base.WidgetView {
  render(): void {
    this._rendered += 1;
    super.render();
  }
  remove(): void {
    this._removed += 1;
    super.remove();
  }
  _removed = 0;
  _rendered = 0;
}

const testWidgets = { TestWidget, TestWidgetView };

export class DummyManager extends ManagerBase {
  constructor() {
    super();
    this.el = window.document.createElement('div');
  }

  protected loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView> {
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

  _get_comm_info(): Promise<{}> {
    return Promise.resolve({});
  }

  _create_comm(): Promise<MockComm> {
    return Promise.resolve(new MockComm());
  }

  el: HTMLElement;
  testClasses: { [key: string]: any } = testWidgets;
}
