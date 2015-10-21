// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "base/js/namespace",
    "nbextensions/widgets/widgets/js/manager",
    "nbextensions/widgets/widgets/js/widget",
    "nbextensions/widgets/widgets/js/register",
    "nbextensions/widgets/widgets/js/widget_link",
    "nbextensions/widgets/widgets/js/widget_bool",
    "nbextensions/widgets/widgets/js/widget_button",
    "nbextensions/widgets/widgets/js/widget_box",
    "nbextensions/widgets/widgets/js/widget_float",
    "nbextensions/widgets/widgets/js/widget_image",
    "nbextensions/widgets/widgets/js/widget_int",
    "nbextensions/widgets/widgets/js/widget_color",
    "nbextensions/widgets/widgets/js/widget_output",
    "nbextensions/widgets/widgets/js/widget_selection",
    "nbextensions/widgets/widgets/js/widget_selectioncontainer",
    "nbextensions/widgets/widgets/js/widget_string",
    "nbextensions/widgets/widgets/js/widget_controller",
], function(IPython, widgetmanager, widget, register) {
    
    // Register all of the loaded models and views with the widget manager.
    for (var i = 4; i < arguments.length; i++) {
        var module = arguments[i];
        register.registerWidgets(module);
    }
    
    // For backwards compatibility and interactive use:
    IPython.WidgetManager = widgetmanager.WidgetManager;
    IPython.Widget = widget.Widget;
    IPython.DOMWidget = widget.DOMWidget;
    
    return {'WidgetManager': widgetmanager.WidgetManager}; 
});
