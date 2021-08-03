// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '../../lib';
import * as Backbone from 'backbone';

import * as sinon from 'sinon';
void sinon;

import { JSONObject } from '@lumino/coreutils';

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
};

export class DummyManager implements widgets.IWidgetManager {
  constructor() {
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

  el: HTMLElement;

  /**
   * Creates a promise for a view of a given model
   *
   * Make sure the view creation is not out of order with
   * any state updates.
   */
  create_view(
    model: widgets.DOMWidgetModel,
    options?: any
  ): Promise<widgets.DOMWidgetView>;
  create_view(
    model: widgets.WidgetModel,
    options?: any
  ): Promise<widgets.WidgetView> {
    throw new Error('Not implemented in dummy manager');
  }

  /**
   * callback handlers specific to a view
   */
  callbacks(view?: widgets.WidgetView): widgets.ICallbacks {
    return {};
  }

  /**
   * Get a promise for a model by model id.
   *
   * #### Notes
   * If a model is not found, undefined is returned (NOT a promise). However,
   * the calling code should also deal with the case where a rejected promise
   * is returned, and should treat that also as a model not found.
   */
  get_model(model_id: string): Promise<widgets.WidgetModel> | undefined {
    // TODO: Perhaps we should return a Promise.reject if the model is not
    // found. Right now this isn't a true async function because it doesn't
    // always return a promise.
    return this._models[model_id];
  }

  /**
   * Create a comm and new widget model.
   * @param  options - same options as new_model but comm is not
   *                          required and additional options are available.
   * @param  serialized_state - serialized model attributes.
   */
  new_widget(
    options: widgets.IWidgetOptions,
    serialized_state: JSONObject = {}
  ): Promise<widgets.WidgetModel> {
    return this.new_model(options, serialized_state);
  }

  register_model(
    model_id: string,
    modelPromise: Promise<widgets.WidgetModel>
  ): void {
    this._models[model_id] = modelPromise;
    modelPromise.then((model) => {
      model.once('comm:close', () => {
        delete this._models[model_id];
      });
    });
  }

  /**
   * Create and return a promise for a new widget model
   *
   * @param options - the options for creating the model.
   * @param serialized_state - attribute values for the model.
   *
   * @example
   * widget_manager.new_model({
   *      model_name: 'IntSlider',
   *      model_module: '@jupyter-widgets/controls',
   *      model_module_version: '1.0.0',
   *      model_id: 'u-u-i-d'
   * }).then((model) => { console.log('Create success!', model); },
   *  (err) => {console.error(err)});
   *
   */
  async new_model(
    options: widgets.IModelOptions,
    serialized_state: any = {}
  ): Promise<widgets.WidgetModel> {
    let model_id;
    if (options.model_id) {
      model_id = options.model_id;
    } else if (options.comm) {
      model_id = options.model_id = options.comm.comm_id;
    } else {
      throw new Error(
        'Neither comm nor model_id provided in options object. At least one must exist.'
      );
    }

    const modelPromise = this._make_model(options, serialized_state);
    // this call needs to happen before the first `await`, see note in `set_state`:
    this.register_model(model_id, modelPromise);
    return await modelPromise;
  }

  async _make_model(
    options: any,
    serialized_state: any = {}
  ): Promise<widgets.WidgetModel> {
    const model_id = options.model_id;
    const model_promise = this.loadClass(
      options.model_name,
      options.model_module,
      options.model_module_version
    );
    let ModelType;
    try {
      ModelType = await model_promise;
    } catch (error) {
      console.error('Could not instantiate widget');
      throw error;
    }

    if (!ModelType) {
      throw new Error(
        `Cannot find model module ${options.model_module}@${options.model_module_version}, ${options.model_name}`
      );
    }

    const attributes = await ModelType._deserialize_state(
      serialized_state,
      this
    );
    const modelOptions = {
      widget_manager: this,
      model_id: model_id,
      comm: options.comm,
    };
    const widget_model = new ModelType(attributes, modelOptions);
    widget_model.name = options.model_name;
    widget_model.module = options.model_module;
    return widget_model;
  }

  /**
   * Resolve a URL relative to the current notebook location.
   *
   * The default implementation just returns the original url.
   */
  resolveUrl(url: string): Promise<string> {
    return Promise.resolve(url);
  }

  inline_sanitize(s: string): string {
    return s;
  }

  /**
   * Dictionary of model ids and model instance promises
   */
  private _models: {
    [key: string]: Promise<widgets.WidgetModel>;
  } = Object.create(null);
}
