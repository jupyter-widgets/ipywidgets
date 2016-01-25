// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "./widgets/js/register",
    "./widgets/js/manager-base",
    "./widgets/js/utils",
    "./widgets/js/widget",
    "./widgets/js/widget_layout",
    "./widgets/js/widget_link",
    "./widgets/js/widget_bool",
    "./widgets/js/widget_button",
    "./widgets/js/widget_box",
    "./widgets/js/widget_float",
    "./widgets/js/widget_image",
    "./widgets/js/widget_int",
    "./widgets/js/widget_color",
    "./widgets/js/widget_selection",
    "./widgets/js/widget_selectioncontainer",
    "./widgets/js/widget_string",
    "./widgets/js/widget_controller"
], function(register) {

    // Bundle all the exports
    exports = Array.prototype.slice.call(arguments, 1).reduce(function(obj, e) {
        return _.extend(obj, e);
    });

    // Register all of the loaded models and views with the widget manager.
    for (var i = 3; i < arguments.length; i++) {
        var module = arguments[i];
        register.registerWidgets(module);
    }

    return exports;
});

