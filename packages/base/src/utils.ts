// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JSONObject, JSONValue, UUID, JSONExt } from '@lumino/coreutils';

import _isEqual from 'lodash/isEqual';
import { WidgetModel } from './widget';

/**
 * Find all strings in the first argument that are not in the second.
 */
export function difference(a: string[], b: string[]): string[] {
  return a.filter(v => b.indexOf(v) === -1);
}

/**
 * Compare two objects deeply to see if they are equal.
 */
export function isEqual(a: unknown, b: unknown): boolean {
  return _isEqual(a, b);
}

/**
 * A polyfill for Object.assign
 *
 * This is from code that Typescript 2.4 generates for a polyfill.
 */
export const assign =
  (Object as any).assign ||
  function(t: any, ...args: any[]): any {
    for (let i = 1; i < args.length; i++) {
      const s = args[i];
      for (const p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  };

/**
 * Generate a UUID
 *
 * http://www.ietf.org/rfc/rfc4122.txt
 */
export function uuid(): string {
  return UUID.uuid4();
}

/**
 * A simple dictionary type.
 */
export type Dict<T> = { [keys: string]: T };

/**
 * Resolve a promiseful dictionary.
 * Returns a single Promise.
 */
export function resolvePromisesDict<V>(
  d: Dict<PromiseLike<V>>
): Promise<Dict<V>> {
  const keys = Object.keys(d);
  const values: PromiseLike<V>[] = [];
  keys.forEach(function(key) {
    values.push(d[key]);
  });
  return Promise.all(values).then(v => {
    const d: Dict<V> = {};
    for (let i = 0; i < keys.length; i++) {
      d[keys[i]] = v[i];
    }
    return d;
  });
}

/**
 * Creates a wrappable Promise rejection function.
 *
 * Creates a function that logs an error message before rethrowing
 * the original error that caused the promise to reject.
 */
export function reject(message: string, log: boolean) {
  return function promiseRejection(error: Error): never {
    if (log) {
      console.error(new Error(message));
    }
    throw error;
  };
}

/**
 * Takes an object 'state' and fills in buffer[i] at 'path' buffer_paths[i]
 * where buffer_paths[i] is a list indicating where in the object buffer[i] should
 * be placed
 * Example: state = {a: 1, b: {}, c: [0, null]}
 * buffers = [array1, array2]
 * buffer_paths = [['b', 'data'], ['c', 1]]
 * Will lead to {a: 1, b: {data: array1}, c: [0, array2]}
 */
export function put_buffers(
  state: Dict<BufferJSON>,
  buffer_paths: (string | number)[][],
  buffers: (
    | DataView
    | ArrayBuffer
    | ArrayBufferView
    | { buffer: ArrayBuffer }
  )[]
): void {
  for (let i = 0; i < buffer_paths.length; i++) {
    const buffer_path = buffer_paths[i];
    // make sure the buffers are DataViews
    let buffer = buffers[i];
    if (!(buffer instanceof DataView)) {
      buffer = new DataView(
        buffer instanceof ArrayBuffer ? buffer : buffer.buffer
      );
    }
    // say we want to set state[x][y][z] = buffer
    let obj = state as any;
    // we first get obj = state[x][y]
    for (let j = 0; j < buffer_path.length - 1; j++) {
      obj = obj[buffer_path[j]];
    }
    // and then set: obj[z] = buffer
    obj[buffer_path[buffer_path.length - 1]] = buffer;
  }
}

export interface ISerializedState {
  state: JSONObject;
  buffers: ArrayBuffer[];
  buffer_paths: (string | number)[][];
}

export interface ISerializeable {
  toJSON(options?: {}): JSONObject;
}

export type BufferJSON =
  | { [property: string]: BufferJSON }
  | BufferJSON[]
  | string
  | number
  | boolean
  | null
  | ArrayBuffer
  | DataView;

export function isSerializable(object: unknown): object is ISerializeable {
  return (typeof object === 'object' && object && 'toJSON' in object) ?? false;
}

export function isObject(data: BufferJSON): data is Dict<BufferJSON> {
  return JSONExt.isObject(data as JSONValue);
}

/**
 * The inverse of put_buffers, return an objects with the new state where all buffers(ArrayBuffer)
 * are removed. If a buffer is a member of an object, that object is cloned, and the key removed. If a buffer
 * is an element of an array, that array is cloned, and the element is set to null.
 * See put_buffers for the meaning of buffer_paths
 * Returns an object with the new state (.state) an array with paths to the buffers (.buffer_paths),
 * and the buffers associated to those paths (.buffers).
 */
export function remove_buffers(
  state: BufferJSON | ISerializeable
): ISerializedState {
  const buffers: ArrayBuffer[] = [];
  const buffer_paths: (string | number)[][] = [];
  // if we need to remove an object from a list, we need to clone that list, otherwise we may modify
  // the internal state of the widget model
  // however, we do not want to clone everything, for performance
  function remove(
    obj: BufferJSON | ISerializeable,
    path: (string | number)[]
  ): BufferJSON {
    if (isSerializable(obj)) {
      // We need to get the JSON form of the object before recursing.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
      obj = obj.toJSON();
    }
    if (Array.isArray(obj)) {
      let is_cloned = false;
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (value) {
          if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
            if (!is_cloned) {
              obj = obj.slice();
              is_cloned = true;
            }
            buffers.push(ArrayBuffer.isView(value) ? value.buffer : value);
            buffer_paths.push(path.concat([i]));
            // easier to just keep the array, but clear the entry, otherwise we have to think
            // about array length, much easier this way
            obj[i] = null;
          } else {
            const new_value = remove(value, path.concat([i]));
            // only assigned when the value changes, we may serialize objects that don't support assignment
            if (new_value !== value) {
              if (!is_cloned) {
                obj = obj.slice();
                is_cloned = true;
              }
              obj[i] = new_value;
            }
          }
        }
      }
    } else if (isObject(obj)) {
      for (const key in obj) {
        let is_cloned = false;
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value) {
            if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
              if (!is_cloned) {
                obj = { ...obj };
                is_cloned = true;
              }
              buffers.push(ArrayBuffer.isView(value) ? value.buffer : value);
              buffer_paths.push(path.concat([key]));
              delete obj[key]; // for objects/dicts we just delete them
            } else {
              const new_value = remove(value, path.concat([key]));
              // only assigned when the value changes, we may serialize objects that don't support assignment
              if (new_value !== value) {
                if (!is_cloned) {
                  obj = { ...obj };
                  is_cloned = true;
                }
                obj[key] = new_value;
              }
            }
          }
        }
      }
    }
    return obj;
  }
  const new_state = remove(state, []) as JSONObject;
  return { state: new_state, buffers: buffers, buffer_paths: buffer_paths };
}

export function findWidgetChildren(
  widget: WidgetModel,
  recursive = false
): Set<WidgetModel> {
  const children = new Set<WidgetModel>();
  _findWidgetChildren(widget, children, recursive ? Infinity : 1);
  children.delete(widget);
  return children;
}

function _findWidgetChildren(
  obj: any,
  found: Set<WidgetModel>,
  levels: number
): void {
  if (obj instanceof WidgetModel) {
    const widget: WidgetModel = obj;
    // stop collecting if already found
    if (found.has(widget)) {
      return;
    }
    found.add(widget);
    if (levels >= 1) {
      for (const name in widget.attributes) {
        const value = widget.attributes[name];
        _findWidgetChildren(value, found, levels - 1);
      }
    }
  } else if (Array.isArray(obj)) {
    for (const value of obj) {
      _findWidgetChildren(value, found, levels);
    }
  } else if (isObject(obj)) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        _findWidgetChildren(value, found, levels);
      }
    }
  }
}

interface IWidgetRelations {
  widget: WidgetModel;
  children: Set<WidgetModel>;
  parents: Set<WidgetModel>;
}

function _removeConnected(
  widget_id: string,
  relations: Map<string, IWidgetRelations>
): void {
  const relation = relations.get(widget_id);
  if (relation) {
    relations.delete(widget_id);
    relation.children.forEach(child => {
      _removeConnected(child.model_id, relations);
    });
    relation.parents.forEach(parent => {
      _removeConnected(parent.model_id, relations);
    });
  }
}

export function findConnectedWidgets(
  widgets: Array<string>,
  allWidgets: Map<string, WidgetModel>
): Set<WidgetModel> {
  const relations = new Map<string, IWidgetRelations>();
  // builds up a 'graph'
  allWidgets.forEach((widget, widget_id) => {
    const relation: IWidgetRelations = {
      widget,
      children: widget.getChildren(),
      parents: new Set()
    };
    relations.set(widget_id, relation);
  });
  // find all parents
  allWidgets.forEach((widget, widget_id) => {
    relations.get(widget_id)?.children.forEach(child => {
      relations.get(child.model_id)?.parents.add(widget);
    });
  });
  // It is easier to think of solving the inverse problem. So we delete all widgets that
  // we connect to from relations
  widgets.forEach(model_id => {
    _removeConnected(model_id, relations);
  });
  // Then the connected widgets, are all widgets that are not anymore in the relations map
  const connected = new Set<WidgetModel>();
  allWidgets.forEach((widget, widget_id) => {
    if (!relations.has(widget_id)) {
      connected.add(widget);
    }
  });
  return connected;
}
