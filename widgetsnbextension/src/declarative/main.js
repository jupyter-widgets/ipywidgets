/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
define([
    'module',
    'base/js/namespace',
    'base/js/events',
    './init/init'
], function(module, Jupyter, events, init) {

    'use strict';

    //create a mapping for declarativewidgets and its dependencies
    requirejs.config({
        map: {
            '*': {
                'jupyter-decl-widgets': 'nbextensions/declarativewidgets/js/widgets'
            },
            'nbextensions/declarativewidgets/js/widgets': {
                'jupyter-js-widgets': 'ipywidgets4-or-jupyter-js-widgets'
            }
        },
        paths: {
            'ipywidgets4-or-jupyter-js-widgets': [
                'does/not/exist',  //HACK: fallbacks was acting strange with 2 items
                Jupyter.notebook.base_url+'nbextensions/widgets/widgets/js/widget',
                Jupyter.notebook.base_url+'nbextensions/jupyter-js-widgets/extension',
            ]
        }
    });

    // Some versions of IE do not have window.console defined. Some versions
    // do not define the debug and other methods. This is a minimal workaround
    // based on what declarative widgets code is using.
    window.console = window.console || {};
    window.console.log = window.console.log || function() {};
    ['debug', 'error', 'trace', 'warn'].forEach(function(method) {
        window.console[method] = window.console[method] || window.console.log;
    });
    
    init({
        namespace: Jupyter,
        events: events
    });

    var getModuleBasedComponentRoot = function() {
        var moduleuri = module.uri;
        return moduleuri.substring(0, moduleuri.lastIndexOf('/'));
    }

    var load_css = function (name) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = name;
        document.getElementsByTagName("head")[0].appendChild(link);
      };

    load_css(getModuleBasedComponentRoot() + '/../css/main.css');

    return {
        load_ipython_extension: function() { console.debug('loaded declarativewidgets'); }
    };
});
