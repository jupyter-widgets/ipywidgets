// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// HACK: node bootstrap requires this.
// global.jQuery = global.$ = require('./jquery');
var _ = require('underscore');

var managerBase = require("./manager-base");
var widget = require("./widget");

/**
 * Registers all of the widget models and views in an object.
 * @param  {object} module - contains widget view and model defs.
 */
function register(module) {
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
    return module;
}

module.exports = {
    shims: {
        services: require("./services-shim")
    }
};

var loadedModules = [
    managerBase,
    require("./utils"),
    register(widget),
    register(require("./widget_layout")),
    register(require("./widget_link")),
    register(require("./widget_bool")),
    register(require("./widget_button")),
    register(require("./widget_box")),
    register(require("./widget_float")),
    register(require("./widget_image")),
    register(require("./widget_int")),
    register(require("./widget_color")),
    register(require("./widget_selection")),
    register(require("./widget_selectioncontainer")),
    register(require("./widget_string")),
    register(require("./widget_controller")),
];
for (var i in loadedModules) {
    if (loadedModules.hasOwnProperty(i)) {
        var loadedModule = loadedModules[i];
        for (var target_name in loadedModule) {
            if (loadedModule.hasOwnProperty(target_name)) {
                module.exports[target_name] = loadedModule[target_name];
            }
        }
    }
}
