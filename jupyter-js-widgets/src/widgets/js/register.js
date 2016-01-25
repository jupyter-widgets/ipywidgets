// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "./manager-base",
    "./widget"
], function(managerBase, widget) {
    "use strict";
    
    /**
     * Registers all of the widget models and views in an object.
     * @param  {object} module - contains widget view and model defs.
     */
    function registerWidgets(module) {
        // Register all of the loaded models and views with the widget manager.
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
    }
    
    return {
        registerWidgets: registerWidgets
    };
});
