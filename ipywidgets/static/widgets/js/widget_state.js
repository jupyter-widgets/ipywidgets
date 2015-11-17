// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

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

    var action = {
        help: 'Download Widget State',
        icon: 'fa-sliders',
        help_index : 'zz',
        handler : save_state
    };

    var action_name = 'save-widget-state';
    var prefix = '';
    Jupyter.notebook.keyboard_manager.actions.register(action, action_name, prefix);

});
