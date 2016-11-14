// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// TODO: ATTEMPT TO KILL THIS MODULE USING THIRD PARTY LIBRARIES WHEN IPYWIDGETS
// IS CONVERTED TO NODE COMMONJS.

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
                        var failure_callback = require_error ? require_error(success_callback, module_version) : innerReject;
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
                    reject(new Error('Class '+class_name+' not found in module '+module_name));
                } else {
                    resolve(module[class_name]);
                }
            });
        } else {
            if (registry && registry[class_name]) {
                resolve(registry[class_name]);
            } else {
                reject(new Error('Class '+class_name+' not found in registry '));
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
function typeset(element: HTMLElement, text: string): void {
    if (text !== void 0) {
        element.textContent = text;
    }
    if (typeof MathJax !== "undefined") {
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
