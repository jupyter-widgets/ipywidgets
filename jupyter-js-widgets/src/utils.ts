// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as _ from 'underscore';

import {
    toByteArray, fromByteArray
} from 'base64-js';

/**
 * http://www.ietf.org/rfc/rfc4122.txt
 */
export
function uuid(): string {
    var s = [];
    var hexDigits = '0123456789ABCDEF';
    for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

    return s.join('');
}

/**
 * Wrappable Error class
 *
 * The Error class doesn't actually act on `this`.  Instead it always
 * returns a new instance of Error.  Here we capture that instance so we
 * can apply it's properties to `this`.
 */
export
class WrappedError extends Error {
    constructor(message, error) {
        super(message);
        // Keep a stack of the original error messages.
        if (error instanceof WrappedError) {
            this.error_stack = error.error_stack;
        } else {
            this.error_stack = [error];
        }
        this.error_stack.push(this);
    }
    error_stack: any[];
}

/**
 * Tries to load a class
 *
 * Tries to load a class from a module using require.js, if a module
 * is specified, otherwise tries to load a class from the global
 * registry, if the global registry is provided.
 *
 * The optional require_error argument is a function that takes the success
 * handler and returns a requirejs error handler, which may call the success
 * handler with a fallback module.
 *
 */

export
function loadClass(class_name, module_name, module_version, registry, require_error): Promise<any> {
    return new Promise(function(resolve, reject) {

        // Try loading the view module using require.js
        if (module_name) {
            // If the module is jupyter-js-widgets, we can just self import.
            var modulePromise;
            var requirejsDefined = typeof window !== 'undefined' && (window as any).requirejs;
            if (requirejsDefined) {
                if (module_name !== 'jupyter-js-widgets' || (window as any).requirejs.defined('jupyter-js-widgets')) {
                    modulePromise = new Promise(function(innerResolve, innerReject) {
                        var success_callback = function(module) {
                            innerResolve(module);
                        };
                        var failure_callback = require_error ? require_error(success_callback, reject, module_version) : reject;
                        (window as any).require([module_name], success_callback, failure_callback);
                    });
                } else if (module_name === 'jupyter-js-widgets') {
                    modulePromise = Promise.resolve(require('../'));
                }
            } else if (module_name === 'jupyter-js-widgets') {
                modulePromise = Promise.resolve(require('../'));
            } else {
                // FUTURE: Investigate dynamic loading methods other than require.js.
                throw new Error(['In order to use third party widgets, you ',
                    'must have require.js loaded on the page.'].join(''));
            }

            modulePromise.then(function(module) {
                if (module[class_name] === undefined) {
                    reject(new Error('Class ' + class_name + ' not found in module ' + module_name));
                } else {
                    resolve(module[class_name]);
                }
            });
        } else {
            if (registry && registry[class_name]) {
                resolve(registry[class_name]);
            } else {
                reject(new Error('Class ' + class_name + ' not found in registry '));
            }
        }
    });
}


/**
 * Resolve a promiseful dictionary.
 * Returns a single Promise.
 */
export
function resolvePromisesDict(d): Promise<any> {
    var keys = Object.keys(d);
    var values = [];
    keys.forEach(function(key) {
        values.push(d[key]);
    });
    return Promise.all(values).then(function(v) {
        d = {};
        for(var i=0; i<keys.length; i++) {
            d[keys[i]] = v[i];
        }
        return d;
    });
}

/**
 * Creates a wrappable Promise rejection function.
 *
 * Creates a function that returns a Promise.reject with a new WrappedError
 * that has the provided message and wraps the original error that
 * caused the promise to reject.
 */
export
function reject(message, log) {
    return function promiseRejection(error) {
        var wrapped_error = new WrappedError(message, error);
        if (log) console.error(wrapped_error);
        return Promise.reject(wrapped_error);
    };
}


/**
 * Apply MathJax rendering to an element, and optionally set its text.
 *
 * If MathJax is not available, make no changes.
 *
 * Parameters
 * ----------
 * element: Node
 * text: optional string
 */
export
function typeset(element: HTMLElement, text?: string): void {
    if (text !== void 0) {
        element.textContent = text;
    }
    if ((window as any).MathJax !== void 0) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
    }
}


/**
 * escape text to HTML
 */
export
function escape_html(text: string): string {
    var esc  = document.createElement('div');
    esc.textContent = text;
    return esc.innerHTML;
};

/**
 * Takes an object 'state' and fills in buffer[i] at 'path' buffer_paths[i]
 * where buffer_paths[i] is a list indicating where in the object buffer[i] should
 * be placed
 * Example: state = {a: 1, b: {}, c: [0, null]}
 * buffers = [array1, array2]
 * buffer_paths = [['b', 'data'], ['c', 1]]
 * Will lead to {a: 1, b: {data: array1}, c: [0, array2]}
 */
export
function put_buffers(state, buffer_paths: (string | number)[][], buffers: DataView[]) {
    for (let i=0; i<buffer_paths.length; i++) {
        let buffer_path = buffer_paths[i];
         // say we want to set state[x][y][z] = buffers[i]
        let obj = state;
        // we first get obj = state[x][y]
        for (let j = 0; j < buffer_path.length-1; j++)
            obj = obj[buffer_path[j]];
        // and then set: obj[z] = buffers[i]
        obj[buffer_path[buffer_path.length-1]] = buffers[i];
    }
}

/**
 * The inverse of put_buffers, return an objects with the new state where all buffers(ArrayBuffer)
 * are removed. If a buffer is a member of an object, that object is cloned, and the key removed. If a buffer
 * is an element of an array, that array is cloned, and the element is set to null.
 * See put_buffers for the meaning of buffer_paths
 * Returns an object with the new state (.state) an array with paths to the buffers (.buffer_paths),
 * and the buffers associated to those paths (.buffers).
 */
export
function remove_buffers(state): {state: any, buffers: ArrayBuffer[], buffer_paths: (string | number)[][]} {
    let buffers: ArrayBuffer[] = [];
    let buffer_paths: (string | number)[][] = [];
    // if we need to remove an object from a list, we need to clone that list, otherwise we may modify
    // the internal state of the widget model
    // however, we do not want to clone everything, for performance
    function remove(obj, path) {
        if (obj.toJSON) {
            // We need to get the JSON form of the object before recursing.
            // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
            obj = obj.toJSON();
        }
        if (Array.isArray(obj)) {
            let is_cloned = false;
            for (let i = 0; i < obj.length; i++) {
                let value = obj[i];
                if(value) {
                    if (value.buffer instanceof ArrayBuffer || value instanceof ArrayBuffer) {
                        if(!is_cloned) {
                            obj = _.clone(obj);
                            is_cloned = true;
                        }
                        buffers.push(value instanceof ArrayBuffer ? value : value.buffer);
                        buffer_paths.push(path.concat([i]));
                        // easier to just keep the array, but clear the entry, otherwise we have to think
                        // about array length, much easier this way
                        obj[i] = null;
                    } else {
                        let new_value  = remove(value, path.concat([i]));
                        // only assigned when the value changes, we may serialize objects that don't support assignment
                        if(new_value !== value) {
                            if(!is_cloned) {
                                obj = _.clone(obj);
                                is_cloned = true;
                            }
                            obj[i] = new_value;
                        }
                    }
                }
            }
        } else if(_.isObject(obj)) {
            for (let key in obj) {
                let is_cloned = false;
                if (obj.hasOwnProperty(key)) {
                    let value = obj[key];
                    if(value) {
                        if (value.buffer instanceof ArrayBuffer || value instanceof ArrayBuffer) {
                            if(!is_cloned) {
                                obj = _.clone(obj);
                                is_cloned = true;
                            }
                            buffers.push(value instanceof ArrayBuffer ? value : value.buffer);
                            buffer_paths.push(path.concat([key]));
                            delete obj[key]; // for objects/dicts we just delete them
                        }
                        else {
                            let new_value  = remove(value, path.concat([key]));
                            // only assigned when the value changes, we may serialize objects that don't support assignment
                            if(new_value !== value) {
                                if(!is_cloned) {
                                    obj = _.clone(obj);
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
    let new_state = remove(state, []);
    return {state: new_state, buffers: buffers, buffer_paths: buffer_paths}
}

let hexTable = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A', '0B', '0C', '0D', '0E', '0F',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', '1E', '1F',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2A', '2B', '2C', '2D', '2E', '2F',
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3A', '3B', '3C', '3D', '3E', '3F',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4A', '4B', '4C', '4D', '4E', '4F',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5A', '5B', '5C', '5D', '5E', '5F',
    '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6A', '6B', '6C', '6D', '6E', '6F',
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7A', '7B', '7C', '7D', '7E', '7F',
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8A', '8B', '8C', '8D', '8E', '8F',
    '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9A', '9B', '9C', '9D', '9E', '9F',
    'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF',
    'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF',
    'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF',
    'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF',
    'E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF',
    'F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'FA', 'FB', 'FC', 'FD', 'FE', 'FF'
];

/**
 * Convert an ArrayBuffer to a hex string.
 */
export
function bufferToHex(buffer: ArrayBuffer): string {
    let x = new Uint8Array(buffer);
    let s = [];
    for (let i = 0; i < x.length; i++) {
        s.push(hexTable[x[i]]);
    }
    return s.join('');
}

/**
 * Convert a hex string to an ArrayBuffer.
 */
export
function hexToBuffer(hex: string): ArrayBuffer {
    let x = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        x[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return x.buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string.
 */
export
function bufferToBase64(buffer: ArrayBuffer): string {
    return fromByteArray(new Uint8Array(buffer));
}

/**
 * Convert a base64 string to an ArrayBuffer.
 */
export
function base64ToBuffer(base64: string): ArrayBuffer {
    return toByteArray(base64).buffer;
}
