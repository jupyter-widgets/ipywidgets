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

var mngr = require("./manager");
var widgetarea = require("./widgetarea");
require("./save_state");
require("./embed_widgets");
require("./widget_output");

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

function register_events(Jupyter, events) {
    // If a kernel already exists, create a widget manager.
    if (Jupyter.notebook && Jupyter.notebook.kernel) {
        handle_kernel(Jupyter, Jupyter.notebook.kernel);
    }
    // When the kernel is created, create a widget manager.
    events.on('kernel_created.Kernel kernel_created.Session', function(event, data) {
        handle_kernel(Jupyter, data.kernel);
    });

    // Create widget areas for cells that already exist.
    var cells = Jupyter.notebook.get_cells();
    for (var i = 0; i < cells.length; i++) {
        handle_cell(cells[i]);
    }

    // Listen to cell creation and deletion events.  When a
    // cell is created, create a widget area for that cell.
    events.on('create.Cell', function(event, data) {
        handle_cell(data.cell);
    });
    // When a cell is deleted, delete the widget area if it
    // exists.
    events.on('delete.Cell', function(event, data) {
        if (data.cell && data.cell.widgetarea) {
            data.cell.widgetarea.dispose();
        }
    });
}

function load_ipython_extension () {
    return new Promise(function(resolve) {
        requirejs([
            "base/js/namespace",
            "base/js/events"
        ], function(Jupyter, events) {
            require("jupyter-js-widgets/css/widgets.min.css");
            register_events(Jupyter, events);
            console.log("loaded widgets");
            resolve();
        });
    });
}

var _ = require('underscore');
module.exports = _.extend({
  load_ipython_extension: load_ipython_extension,
}, require('jupyter-js-widgets'), require('./widget_output'));
