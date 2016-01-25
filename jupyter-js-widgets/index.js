// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// This is the main file that will be loaded when jupyter-js-widgets is
// required in an npm environment.

// HACK: node bootstrap requires this.
global.jQuery = global.$ = require('jquery');
require('jquery-ui');
require('bootstrap');
require('underscore');

var register = require("./src/widgets/js/register");
[
    require("./src/widgets/js/manager-base"),
    require("./src/widgets/js/widget"),
    require("./src/widgets/js/widget_layout"),
    require("./src/widgets/js/widget_link"),
    require("./src/widgets/js/widget_bool"),
    require("./src/widgets/js/widget_button"),
    require("./src/widgets/js/widget_box"),
    require("./src/widgets/js/widget_float"),
    require("./src/widgets/js/widget_image"),
    require("./src/widgets/js/widget_int"),
    require("./src/widgets/js/widget_color"),
    require("./src/widgets/js/widget_selection"),
    require("./src/widgets/js/widget_selectioncontainer"),
    require("./src/widgets/js/widget_string"),
    require("./src/widgets/js/widget_controller"),
    require("./src/widgets/js/utils")
].forEach(function(module) {
    register.registerWidgets(module);

    Object.keys(module).forEach(function(name) {
        exports[name] = module[name];
    });
});

exports.shims = {
    services: require("./src/widgets/js/services-shim")
};
