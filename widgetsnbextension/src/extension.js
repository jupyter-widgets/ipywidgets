// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

window['requirejs'].config({
    map: {
        '*': {
            'jupyter-js-widgets': 'nbextensions/jupyter-js-widgets/extension',
        },
    }
});

var MIME_TYPE = 'application/vnd.jupyter.widget-view+json';
var CLASS_NAME = 'jupyter-widgets-output';

var mngr = require("./manager");
var widgetarea = require("./widgetarea");
require("./save_state");
require("./embed_widgets");
var PhosphorWidget = require("@phosphor/widgets");

/**
 * Create a widget manager for a kernel instance.
 */
var handle_kernel = function(Jupyter, kernel) {
    if (kernel.comm_manager && kernel.widget_manager === undefined) {

        // Create a widget manager instance. Use the global
        // Jupyter.notebook handle.
        var manager = new mngr.WidgetManager(kernel.comm_manager, Jupyter.notebook);

        // For backwards compatibility and interactive use.
        Jupyter.WidgetManager = mngr.WidgetManager;

        // Store a handle to the manager so we know not to
        // another for this kernel. This also is a convenience
        // for the user.
        kernel.widget_manager = manager;
    }
};

/**
 * Creates a widgetarea for the cell if it is a CodeCell.
 * If the cell isn't a CodeCell, no action is taken.
 */
var handle_cell = function(cell) {
    if (cell.cell_type==='code') {
        var area = new widgetarea.WidgetArea(cell);
        cell.widgetarea = area;
    }
};

function register_events(Jupyter, events, outputarea) {
    // If a kernel already exists, create a widget manager.
    if (Jupyter.notebook && Jupyter.notebook.kernel) {
        handle_kernel(Jupyter, Jupyter.notebook.kernel);
    }
    // When the kernel is created, create a widget manager.
    events.on('kernel_created.Kernel kernel_created.Session', function(event, data) {
        handle_kernel(Jupyter, data.kernel);
    });

    /**
     * Render data to the output area
     */
    function render(data, node) {
        // data is a model id
        // TODO: Get a handle on the widget manager

        var manager = Jupyter.notebook.kernel.widget_manager;
        if (!manager) {
            node.textContent = "Missing widget manager";
            return;
        }

        var model = manager.get_model(data.model_id);
        if (model) {
            model.then(function(model) {
                return manager.display_model(void 0, model, void 0);
            }).then(function(pwidget) {
                PhosphorWidget.Widget.attach(pwidget, node);
                //node.textContent = "Rendered widget! "+JSON.stringify(data);
            });
        } else {
            node.textContent = "Widget not found: "+JSON.stringify(data);
        }
    }


    var append_mime = function(json, md, element) {
        var type = MIME_TYPE;
        var toinsert = this.create_output_subarea(md, CLASS_NAME, type);
        this.keyboard_manager.register_events(toinsert);
        render(json, toinsert[(0)]);
        element.append(toinsert);
        return toinsert;
    };
    // Register mime type with the output area
    outputarea.OutputArea.prototype.register_mime_type(MIME_TYPE, append_mime, {
        // Is output safe (no Javascript)?
        safe: true,
        // Index of renderer in `output_area.display_order`
        index: 0
    });


/* Stuff to still do things with

    events.on('resize.Cell', function(event, data) {
        // TODO: get the resize event down to the widget area where phosphor can
        // see it
        data.cell.widgetarea && data.cell.widgetarea.resize();
    });

    var disconnectWidgetAreas = function() {
        // TODO: notify the widget output that it has been disconnected so it
        // can put up the broken link icon
        var cells = Jupyter.notebook.get_cells();
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.widgetarea && cell.widgetarea.disconnect();
        }
    }
    events.on('kernel_disconnected.Kernel', disconnectWidgetAreas);
    events.on('kernel_killed.Kernel', disconnectWidgetAreas);
    events.on('kernel_restarting.Kernel', disconnectWidgetAreas);
    events.on('kernel_dead.Kernel', disconnectWidgetAreas);
    */
}

function load_ipython_extension () {
    return new Promise(function(resolve) {
        requirejs([
            "base/js/namespace",
            "base/js/events",
            "notebook/js/outputarea"
        ], function(Jupyter, events, outputarea) {
            require("@phosphor/widgets/style/index.css")
            require('jupyter-js-widgets/css/widgets.css');
            register_events(Jupyter, events, outputarea);
            resolve();
        });
    });
}

var _ = require('underscore');
module.exports = _.extend({
  load_ipython_extension: load_ipython_extension,
}, require('jupyter-js-widgets'), require('./widget_output'));
