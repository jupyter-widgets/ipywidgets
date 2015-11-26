// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "base/js/namespace",
    "./manager",
    "./widget",
    "./register",
    "./widget_state",
    "./style",
    "./widget_link",
    "./widget_bool",
    "./widget_button",
    "./widget_box",
    "./widget_float",
    "./widget_image",
    "./widget_int",
    "./widget_color",
    "./widget_output",
    "./widget_selection",
    "./widget_selectioncontainer",
    "./widget_string",
    "./widget_controller",
], function(IPython, widgetmanager, widget, register, state) {
    
    // Register all of the loaded models and views with the widget manager.
    for (var i = 5; i < arguments.length; i++) {
        var module = arguments[i];
        register.registerWidgets(module);
    }
    
    // For backwards compatibility and interactive use:
    IPython.WidgetManager = widgetmanager.WidgetManager;
    IPython.Widget = widget.Widget;
    IPython.DOMWidget = widget.DOMWidget;
    
    return {'WidgetManager': widgetmanager.WidgetManager}; 
});
