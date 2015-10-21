// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// TODO: ATTEMPT TO KILL THIS MODULE USING THIRD PARTY LIBRARIES WHEN IPYWIDGETS 
// IS CONVERTED TO NODE COMMONJS.

// npm compatibility
if (typeof define !== 'function') { var define = require('./requirejs-shim')(module); }

define([
    "jquery", 
    "nbextensions/widgets/widgets/js/manager-base",
    "nbextensions/widgets/widgets/js/widget"
], function($, managerBase, widget) {
    "use strict";
    
    /**
     * Registers all of the widget models and views in an object.
     * @param  {object} module - contains widget view and model defs.
     */
    function registerWidgets(module) {
        // Register all of the loaded models and views with the widget manager.
        for (var target_name in module) {
            if (module.hasOwnProperty(target_name)) {
                var target = module[target_name];
                if (target.prototype instanceof widget.WidgetModel) {
                    managerBase.ManagerBase.register_widget_model(target_name, target);
                } else if (target.prototype instanceof widget.WidgetView) {
                    managerBase.ManagerBase.register_widget_view(target_name, target);
                }
            }
        }
    }
    
    /**
     * http://www.ietf.org/rfc/rfc4122.txt
     */
    function uuid() {
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        for (var i = 0; i < 32; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

        return s.join("");
    }

    /**
     * Wrappable Error class
     *
     * The Error class doesn't actually act on `this`.  Instead it always
     * returns a new instance of Error.  Here we capture that instance so we
     * can apply it's properties to `this`.
     */
    function WrappedError(message, error){
        var tmp = Error.apply(this, [message]);

        // Copy the properties of the error over to this.
        var properties = Object.getOwnPropertyNames(tmp);
        for (var i = 0; i < properties.length; i++) {
            this[properties[i]] = tmp[properties[i]];
        }

        // Keep a stack of the original error messages.
        if (error instanceof WrappedError) {
            this.error_stack = error.error_stack;
        } else {
            this.error_stack = [error];
        }
        this.error_stack.push(tmp);

        return this;
    }
    WrappedError.prototype = Object.create(Error.prototype, {});


    /**
     * Tries to load a class
     *
     * Tries to load a class from a module using require.js, if a module 
     * is specified, otherwise tries to load a class from the global 
     * registry, if the global registry is provided.
     */
    function loadClass(class_name, module_name, registry) {
        return new Promise(function(resolve, reject) {

            // Try loading the view module using require.js
            if (module_name) {
                require([module_name], function(module) {
                    if (module[class_name] === undefined) {
                        reject(new Error('Class '+class_name+' not found in module '+module_name));
                    } else {
                        resolve(module[class_name]);
                    }
                }, reject);
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
    function resolvePromisesDict(d) {
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
    function reject(message, log) {
        return function promiseRejection(error) { 
            var wrapped_error = new WrappedError(message, error);
            if (log) console.error(wrapped_error); 
            return Promise.reject(wrapped_error); 
        };
    }

    /**
     * Apply MathJax rendering to an element, and optionally set its text
     *
     * If MathJax is not available, make no changes.
     *
     * Returns the output any number of typeset elements, or undefined if
     * MathJax was not available.
     *
     * Parameters
     * ----------
     * element: Node, NodeList, or jQuery selection
     * text: option string
     */
    function typeset(element, text) {
        var $el = element.jquery ? element : $(element);
        if(arguments.length > 1){
            $el.text(text);
        }
        if(!window.MathJax){
            return;
        }
        return $el.map(function(){
            // MathJax takes a DOM node: $.map makes `this` the context
            return MathJax.Hub.Queue(["Typeset", MathJax.Hub, this]);
        });
    }
    
    /**
     * escape text to HTML
     */
    var escape_html = function (text) {
        return $("<div/>").text(text).html();
    };
    
    return {
        uuid: uuid,
        WrappedError: WrappedError,
        loadClass: loadClass,
        resolvePromisesDict: resolvePromisesDict,
        reject: reject,
        typeset: typeset,
        escape_html: escape_html,
        registerWidgets: registerWidgets
    };
});
