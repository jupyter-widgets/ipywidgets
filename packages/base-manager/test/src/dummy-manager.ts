// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/base';
import * as Backbone from 'backbone';

import { ManagerBase } from '../../lib';

import * as sinon from 'sinon';
void sinon;

let numComms = 0;

export class MockComm implements widgets.IClassicComm {
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

const typesToArray: { [key: string]: any } = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array,
};

const JSONToArray = function (obj: any): any {
  return new typesToArray[obj.dtype](obj.buffer.buffer);
};

const arrayToJSON = function (obj: any): any {
  const dtype = Object.keys(typesToArray).filter(
    (i) => typesToArray[i] === obj.constructor
  )[0];
  return { dtype, buffer: obj };
};

const array_serialization = {
  deserialize: JSONToArray,
  serialize: arrayToJSON,
};

class TestWidget extends widgets.WidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
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
class ModelErrorWidget extends widgets.WidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_module: 'test-widgets',
      _model_name: 'ModelErrorWidget',
      _model_module_version: '1.0.0',
    };
  }
  initialize(attributes: Backbone.ObjectHash, options: any) {
    throw new Error('Model error');
  }
}
class ModelWithMissingView extends widgets.WidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_module: 'test-widgets',
      _model_name: 'ModelWithViewError',
      _model_module_version: '1.0.0',
      _view_module: 'test-widgets',
      _view_name: 'MissingView',
      _view_module_version: '1.0.0',
    };
  }
}
class ModelWithViewError extends widgets.WidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_module: 'test-widgets',
      _model_name: 'ModelWithViewError',
      _model_module_version: '1.0.0',
      _view_module: 'test-widgets',
      _view_name: 'ViewErrorWidget',
      _view_module_version: '1.0.0',
    };
  }
}

class ViewErrorWidget extends widgets.WidgetView {
  render(): void {
    throw new Error('Render error');
  }
}

class TestWidgetView extends widgets.WidgetView {
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

class BinaryWidget extends TestWidget {
  static serializers = {
    ...widgets.WidgetModel.serializers,
    array: array_serialization,
  };
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'BinaryWidget',
      _view_name: 'BinaryWidgetView',
      array: new Int8Array(0),
    };
  }
}

class BinaryWidgetView extends TestWidgetView {
  render(): void {
    this._rendered += 1;
  }
  _rendered = 0;
}

const testWidgets = {
  TestWidget,
  TestWidgetView,
  BinaryWidget,
  BinaryWidgetView,
  ModelErrorWidget,
  ModelWithViewError,
  ViewErrorWidget,
  ModelWithMissingView,
};

export class DummyManager extends ManagerBase {
  constructor() {
    super();
    this.el = window.document.createElement('div');
  }

  protected loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<any> {
    if (moduleName === '@jupyter-widgets/base') {
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
}
