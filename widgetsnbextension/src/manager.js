// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var _ = require("underscore");
var Backbone = require("backbone");
var base = require("@jupyter-widgets/base");
var widgets = require("@jupyter-widgets/controls");
var outputWidgets = require("./widget_output");
var saveState = require("./save_state");
var embedWidgets = require("./embed_widgets");
var version = require("../package.json").version;
var output = require("./widget_output");

var MIME_TYPE = 'application/vnd.jupyter.widget-view+json';

//--------------------------------------------------------------------
// WidgetManager class
//--------------------------------------------------------------------
var WidgetManager = function (comm_manager, notebook) {
    base.ManagerBase.apply(this);
    WidgetManager._managers.push(this);

    // Attach a comm manager
    this.notebook = notebook;
    this.keyboard_manager = notebook.keyboard_manager;
    this.comm_manager = comm_manager;

    var widget_md = notebook.metadata.widgets
    if (widget_md && widget_md['application/vnd.jupyter.widget-state+json']) {
        this.set_state(notebook.metadata.widgets['application/vnd.jupyter.widget-state+json'])
    }

    // Register with the comm manager.
    this.comm_manager.register_target(this.comm_target_name, _.bind(this.handle_comm_open,this));

    // Attempt to reconstruct any live comms by requesting them from the back-end.
    var that = this;
    var backed_widgets_loaded = this._get_comm_info().then(function(comm_ids) {

        // Create comm class instances from comm ids.
        var comm_promises = Object.keys(comm_ids).map(function(comm_id) {
            return that._create_comm(that.comm_target_name, comm_id);
        });

        // Send a state request message out for each widget comm and wait
        // for the responses.
        return Promise.all(comm_promises).then(function(comms) {
            return Promise.all(comms.map(function(comm) {
                var update_promise = new Promise(function(resolve, reject) {
                    comm.on_msg(function (msg) {
                        // A suspected response was received, check to see if
                        // it's a state update. If so, resolve.
                        if (msg.content.data.method === 'update') {
                            resolve({
                                comm: comm,
                                msg: msg
                            });
                        }
                    });
                });
                comm.send({
                    method: 'request_state'
                }, that.callbacks());
                return update_promise;
            }));
        }).then(function(widgets_info) {
            return Promise.all(widgets_info.map(function(widget_info) {
                return that.new_model({
                    model_name: widget_info.msg.content.data.state._model_name,
                    model_module: widget_info.msg.content.data.state._model_module,
                    model_module_version: widget_info.msg.content.data.state._model_module_version,
                    comm: widget_info.comm,
                }, widget_info.msg.content.data.state);
            }));
        }).then(function() {
            // Rerender cells that have widget data
            that.notebook.get_cells().forEach(function(cell) {
                var rerender = cell.output_area && cell.output_area.outputs.find(function(output) {
                    return output.data && output.data[MIME_TYPE];
                });
                if (rerender) {
                    that.notebook.render_cell_output(cell);
                }
            });
        });
    });

    // Create the actions and menu
    this._init_actions();
    this._init_menu();
};

WidgetManager.prototype = Object.create(base.ManagerBase.prototype);
WidgetManager._managers = []; /* List of widget managers */

WidgetManager.prototype.loadClass = function(className, moduleName, moduleVersion) {
    if (moduleName === "@jupyter-widgets/controls") {
        return Promise.resolve(widgets[className]);
    } else if (moduleName === "@jupyter-widgets/base") {
        return Promise.resolve(base[className]);
    } else if (moduleName == "@jupyter-widgets/output") {
        return Promise.resolve(outputWidgets[className]);
    } else {
        return new Promise(function(resolve, reject) {
            window.require([moduleName], resolve, reject);
        }).then(function(mod) {
            if (mod[className]) {
                return mod[className];
            } else {
                return Promise.reject('Class ' + className + ' not found in module ' + moduleName);
            }
        });
    }
}

/**
 * Registers manager level actions with the notebook actions list
 */
WidgetManager.prototype._init_actions = function() {
    var notifier = Jupyter.notification_area.widget('widgets');
    this.saveWidgetsAction = {
        handler: (function() {
            this.get_state({
                drop_defaults: true
            }).then(function(state) {
                Jupyter.notebook.metadata.widgets = {
                    'application/vnd.jupyter.widget-state+json' : state
                };
                Jupyter.menubar.actions.get('jupyter-notebook:save-notebook').handler({
                    notebook: Jupyter.notebook
                });
            });
        }).bind(this),
        icon: 'fa-truck',
        help: 'Save the notebook with the widget state information for static rendering'
    };
    Jupyter.menubar.actions.register(this.saveWidgetsAction, 'save-with-widgets', 'widgets');

    this.clearWidgetsAction = {
        handler: (function() {
            delete Jupyter.notebook.metadata.widgets;
            Jupyter.menubar.actions.get('jupyter-notebook:save-notebook').handler({
                notebook: Jupyter.notebook
            });
        }),
        help: 'Clear the widget state information from the notebook'
    };
    Jupyter.menubar.actions.register(this.saveWidgetsAction, 'save-clear-widgets', 'widgets');
};

/**
 * Initialize the widget menu
 */
WidgetManager.prototype._init_menu = function() {

    // Add a widgets menubar item, before help.
    var widgetsMenu = document.createElement('li');
    widgetsMenu.classList.add('dropdown');
    var helpMenu = document.querySelector('#help_menu').parentElement;
    helpMenu.parentElement.insertBefore(widgetsMenu, helpMenu);

    var widgetsMenuLink = document.createElement('a');
    widgetsMenuLink.setAttribute('href', '#');
    widgetsMenuLink.setAttribute('data-toggle', 'dropdown');
    widgetsMenuLink.classList.add('dropdown-toggle');
    widgetsMenuLink.innerText = 'Widgets';
    widgetsMenu.appendChild(widgetsMenuLink);

    var widgetsSubmenu = document.createElement('ul');
    widgetsSubmenu.setAttribute('id', 'widget-submenu');
    widgetsSubmenu.classList.add('dropdown-menu');
    widgetsMenu.appendChild(widgetsSubmenu);

    var divider = document.createElement('ul');
    divider.classList.add('divider');

    widgetsSubmenu.appendChild(this._createMenuItem('Save Notebook Widget State', this.saveWidgetsAction));
    widgetsSubmenu.appendChild(this._createMenuItem('Clear Notebook Widget State', this.clearWidgetsAction));
    widgetsSubmenu.appendChild(divider);
    widgetsSubmenu.appendChild(this._createMenuItem('Download Widget State', saveState.action));
    widgetsSubmenu.appendChild(this._createMenuItem('Embed Widgets', embedWidgets.action));
};

/**
 * Creates a menu item for an action.
 * @param  {string} title - display string for the menu item
 * @param  {Action} action
 * @return {HTMLElement} menu item
 */
WidgetManager.prototype._createMenuItem = function(title, action) {
    var item = document.createElement('li');
    item.setAttribute('title', action.help);

    var itemLink = document.createElement('a');
    itemLink.setAttribute('href', '#');
    itemLink.innerText = title;
    item.appendChild(itemLink);

    item.onclick = action.handler;
    return item;
};



WidgetManager.prototype.display_view = function(msg, view, options) {
    return Promise.resolve(view);
}


WidgetManager.prototype._create_comm = function(comm_target_name, comm_id, data, metadata) {
    var that = this;
    return this._get_connected_kernel().then(function(kernel) {
        if (data || metadata) {
            return kernel.comm_manager.new_comm(comm_target_name, data,
                                                that.callbacks(), metadata, comm_id);
        } else {
            // Construct a comm that already is open on the kernel side. We
            // don't want to send an open message, which would supersede the
            // kernel comm object, so we instead do by hand the necessary parts
            // of the new_comm call above.
            return new Promise(function(resolve) {
                requirejs(["services/kernels/comm"], function(comm) {
                    var new_comm = new comm.Comm(comm_target_name, comm_id);
                    kernel.comm_manager.register_comm(new_comm);
                    resolve(new_comm);
                });
            });
        }
    });
};

WidgetManager.prototype._get_comm_info = function() {
    /**
     * Gets a promise for the valid widget models.
     */
    var that = this;
    return this._get_connected_kernel().then(function(kernel) {
        return new Promise(function(resolve, reject) {
            kernel.comm_info('jupyter.widget', function(msg) {
                resolve(msg['content']['comms']);
            });
        });
    });
};

WidgetManager.prototype._get_connected_kernel = function() {
    /**
     * Gets a promise for a connected kernel
     */
    var that = this;
    return new Promise(function(resolve, reject) {
        if (that.comm_manager &&
            that.comm_manager.kernel &&
            that.comm_manager.kernel.is_connected()) {

            resolve(that.comm_manager.kernel);
        } else {
            that.notebook.events.on('kernel_connected.Kernel', function(event, data) {
                resolve(data.kernel);
            });
        }
    });
};

WidgetManager.prototype.setViewOptions = function (options) {
    var options = options || {};
    if (!options.output && options.parent) {
        // use the parent output if we don't have one
        options.output = options.parent.options.output;
    }
    options.iopub_callbacks = {
        output: options.output.handle_output.bind(options.output),
        clear_output: options.output.handle_clear_output.bind(options.output)
    }
    return options;
};

/**
 * Callback handlers for a specific view
 */
WidgetManager.prototype.callbacks = function (view) {
    var callbacks = base.ManagerBase.prototype.callbacks.call(this, view);
    if (view && view.options.iopub_callbacks) {
        callbacks.iopub = view.options.iopub_callbacks
    }
    return callbacks;
};


module.exports = {
    WidgetManager: WidgetManager
};
