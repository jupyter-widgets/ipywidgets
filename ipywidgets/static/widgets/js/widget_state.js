// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// npm compatibility
if (typeof define !== 'function') { var define = require('./requirejs-shim')(module); }

define(["base/js/namespace"], function(Jupyter) {
    "use strict";

    var save_state = function() {
        Jupyter.WidgetManager._managers[0].get_state().then(function(state) {
            var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, "    "));
            var a = document.createElement("a");
            a.download = "state.json";
            a.href = "data:" + data;
            a.click();
        });
    };

    var load_extension = function() {
        Jupyter.toolbar.add_buttons_group([{
            id : 'widget_manager_state',
            label : 'Download Widget State',
            icon : 'fa-sliders',
            callback : save_state
        }]);
    };

    load_extension();

});
