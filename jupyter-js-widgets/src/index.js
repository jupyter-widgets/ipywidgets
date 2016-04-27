// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// HACK: node bootstrap requires this.
global.jQuery = global.$ = require('./jquery');

module.exports = {
    shims: {
        services: require('./services-shim')
    }
};

var loadedModules = [
    require("./manager-base"),
    require("./embed-helper"),
    require("./embed-manager"),
    require("./utils"),
    require("./widget"),
    require("./widget_layout"),
    require("./widget_link"),
    require("./widget_bool"),
    require("./widget_button"),
    require("./widget_box"),
    require("./widget_float"),
    require("./widget_image"),
    require("./widget_int"),
    require("./widget_color"),
    require("./widget_selection"),
    require("./widget_selectioncontainer"),
    require("./widget_string"),
    require("./widget_controller"),
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

module.exports['version'] = require('../package.json').version;
