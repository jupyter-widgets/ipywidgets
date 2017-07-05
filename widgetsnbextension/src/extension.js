// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

window['requirejs'].config({
    map: {
        '*': {
            '@jupyter-widgets/controls': 'nbextensions/jupyter-js-widgets/extension',
            '@jupyter-widgets/base': 'nbextensions/jupyter-js-widgets/extension',
            '@jupyter-widgets/output': 'nbextensions/jupyter-js-widgets/extension',
        },
    }
});

var MIME_TYPE = 'application/vnd.jupyter.widget-view+json';
var CLASS_NAME = 'jupyter-widgets-view';

var mngr = require("./manager");
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
     * The views on this page. We keep this list so that we can call the view.remove()
     * method when a view is removed from the page.
     */
    var views = {};
    var removeView = function(event, data) {
        var output = data.cell ? data.cell.output_area : data.output_area;
        var viewids = output ? output._jupyterWidgetViews : void 0;
        if (viewids) {
            viewids.forEach(function(id) {
                // this may be called after the widget is pulled off the page
                // so we temporarily put it back on the page as a kludge
                // so that phosphor can trigger the appropriate detach signals
                var view = views[id];
                view.el.style.display="none";
                document.body.appendChild(view.el);
                view.remove();
                delete views[id];
            });
            output._jupyterWidgetViews = [];
        }
    }

    // Deleting a cell does *not* clear the outputs first.
    events.on('delete.Cell', removeView);
    // add an event to the notebook element for *any* outputs that are cleared.
    Jupyter.notebook.container.on('clearing', '.output', removeView);

    // For before https://github.com/jupyter/notebook/pull/2411 is merged and
    // released. This does not handle the case where an empty cell is executed
    // to clear input.
    events.on('execute.CodeCell', removeView);
    events.on('clear_output.CodeCell', removeView);

    /**
     * Render data to the output area.
     */
    function render(output, data, node) {
        // data is a model id
        var manager = Jupyter.notebook.kernel.widget_manager;
        if (!manager) {
            node.textContent = "Missing widget manager";
            return;
        }

        var model = manager.get_model(data.model_id);
        if (model) {
            model.then(function(model) {
                return manager.display_model(void 0, model, {output: output});
            }).then(function(view) {
                var id = view.cid;
                output._jupyterWidgetViews = output._jupyterWidgetViews || [];
                output._jupyterWidgetViews.push(id);
                views[id] = view;
                PhosphorWidget.Widget.attach(view.pWidget, node);
            });
        } else {
            node.textContent = "Widget not found: "+JSON.stringify(data);
        }
    }

    // `this` is the output area we are appending to
    var append_mime = function(json, md, element) {
        var toinsert = this.create_output_subarea(md, CLASS_NAME, MIME_TYPE);
        this.keyboard_manager.register_events(toinsert);
        render(this, json, toinsert[0]);
        element.append(toinsert);
        return toinsert;
    };
    // Register mime type with the output area
    outputarea.OutputArea.prototype.register_mime_type(MIME_TYPE, append_mime, {
        // An output widget could contain arbitrary user javascript
        safe: false,
        // Index of renderer in `output_area.display_order`
        index: 0
    });
}

function load_ipython_extension () {
    return new Promise(function(resolve) {
        requirejs([
            "base/js/namespace",
            "base/js/events",
            "notebook/js/outputarea"
        ], function(Jupyter, events, outputarea) {
            require("@phosphor/widgets/style/index.css");
            require("@jupyter-widgets/base/css/index.css");
            require('@jupyter-widgets/controls/css/widgets.css');
            register_events(Jupyter, events, outputarea);
            resolve();
        });
    });
}

var _ = require('underscore');
module.exports = _.extend({
  load_ipython_extension: load_ipython_extension,
}, require('@jupyter-widgets/controls'), require('@jupyter-widgets/base'), require('./widget_output'));
