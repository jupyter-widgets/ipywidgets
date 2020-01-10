// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/base';
import * as services from '@jupyterlab/services';
import { DummyManager } from './dummy-manager';

let numComms = 0;

export class MockComm implements widgets.IClassicComm {
  constructor() {
    this.comm_id = `mock-comm-id-${numComms}`;
    numComms += 1;
  }

  on_close(fn: Function | null): void {
    this._on_close = fn;
  }

  on_msg(fn: Function | null): void {
    this._on_msg = fn;
  }

  _process_msg(msg: services.KernelMessage.ICommMsgMsg): void | Promise<void> {
    if (this._on_msg) {
      return this._on_msg(msg);
    } else {
      return Promise.resolve();
    }
  }

  open(
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    if (this._on_open) {
      this._on_open();
    }
    return '';
  }

  close(
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    if (this._on_close) {
      this._on_close();
    }
    return '';
  }

  send(
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    return '';
  }

  comm_id: string;
  target_name: string;
  _on_msg: Function | null = null;
  _on_close: Function | null = null;
  _on_open: Function | null = null;
}

export interface IConstructor<T> {
  new (attributes?: any, options?: any): T;
}

export function createTestModel<T extends widgets.WidgetModel>(
  constructor: IConstructor<T>,
  attributes?: any,
  widget_manager?: widgets.WidgetModel['widget_manager']
): T {
  const id = widgets.uuid();
  const modelOptions = {
    widget_manager: widget_manager || new DummyManager(),
    model_id: id
  };

  return new constructor(attributes, modelOptions);
}

export async function createTestModelFromSerialized<
  T extends widgets.WidgetModel
>(
  constructor: IConstructor<T>,
  state?: any,
  widget_manager?: widgets.WidgetModel['widget_manager']
): Promise<T> {
  widget_manager = widget_manager || new DummyManager();
  const attributes = await (constructor as any)._deserialize_state(
    state,
    widget_manager
  );

  return createTestModel(constructor, attributes, widget_manager);
}

export function createTestView<T extends widgets.WidgetView>(
  model: widgets.WidgetModel,
  viewCtor: IConstructor<T>
): Promise<T> {
  const mgr = model.widget_manager as DummyManager;
  mgr.testClasses[model.get('_view_name')] = viewCtor;
  return model.widget_manager.create_view(model, undefined) as any;
}
