// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// This is the main file that will be loaded when ipywidgets is required in an
// npm environment.

// HACK: node bootstrap requires this.
global.jQuery = global.$ = require('jquery');
require('jquery-ui');
require('bootstrap');
require('underscore');

var register = require("./static/widgets/js/register");
[
    require("./static/widgets/js/manager-base"),
    require("./static/widgets/js/widget"),
    require("./static/widgets/js/widget_link"),
    require("./static/widgets/js/widget_bool"),
    require("./static/widgets/js/widget_button"),
    require("./static/widgets/js/widget_box"),
    require("./static/widgets/js/widget_float"),
    require("./static/widgets/js/widget_image"),
    require("./static/widgets/js/widget_int"),
    require("./static/widgets/js/widget_color"),
    require("./static/widgets/js/widget_selection"),
    require("./static/widgets/js/widget_selectioncontainer"),
    require("./static/widgets/js/widget_string"),
    require("./static/widgets/js/widget_controller")
].forEach(function(module) {
    register.registerWidgets(module);
    
    Object.keys(module).forEach(function(name) {
        exports[name] = module[name];
    });
});
