// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var _ = require("underscore");
var Backbone = require("backbone");
var widgets = require("jupyter-js-widgets");
var saveState = require("./save_state");
var embedWidgets = require("./embed_widgets");
var version = require("../package.json").version;
var output = require("./widget_output");

//--------------------------------------------------------------------
// WidgetManager class
//--------------------------------------------------------------------
var WidgetManager = function (comm_manager, notebook) {
    widgets.ManagerBase.apply(this);
    WidgetManager._managers.push(this);

    // Attach a comm manager
    this.notebook = notebook;
    this.keyboard_manager = notebook.keyboard_manager;
    this.comm_manager = comm_manager;

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
            var cells = that.notebook.get_cells();
            var outputs, cell;
            for (var i = 0; i < cells.length; ++i) {
                cell = cells[i];
                if (cell.output_area) {
                    outputs = cell.output_area.outputs;
                    for (var j = 0; j < outputs.length; ++j) {
                        if (outputs[j].data['application/vnd.jupyter.widget-view+json']) {
                            var model_promise = that.get_model(outputs[j].data['application/vnd.jupyter.widget-view+json'].model_id);
                            if (model_promise !== undefined) {
                                model_promise.then((function(cell_index) {
                                    return function (model) {
                                        that.display_model(undefined, model, { cell_index: cell_index });
                                    };
                                })(i));
                            }
                        }
                    }
                }
            }
        });
    });

    // Setup state saving code.
    this.notebook.events.on('before_save.Notebook', (function() {
        var save_callback = WidgetManager._save_callback;
        if (save_callback) {
            this.get_state(WidgetManager._get_state_options).then((function(state) {
                save_callback.call(this, state);
            }).bind(this)).catch(widgets.reject('Could not call widget save state callback.', true));
        }
    }).bind(this));

    // Validate the version requested by the backend.
    var validate = (function validate() {
        this.validateVersion().then(function(valid) {
            if (!valid) {
                console.warn('Widget frontend version does not match the backend.');
            }
        }).catch(function(err) {
            console.warn('Could not cross validate the widget frontend and backend versions.', err);
        });
    }).bind(this);
    validate();

    // Revalidate the version when a new kernel connects.
    this.notebook.events.on('kernel_connected.Kernel', function(event, data) {
        validate();
    });

    // Create the actions and menu
    this._init_actions();
    this._init_menu();
};

WidgetManager.prototype = Object.create(widgets.ManagerBase.prototype);
WidgetManager._managers = []; /* List of widget managers */
WidgetManager._load_callback = null;
WidgetManager._save_callback = null;


WidgetManager.register_widget_model = function (model_name, model_type) {
    /**
     * Registers a widget model by name.
     */
    return widgets.ManagerBase.register_widget_model.apply(this, arguments);
};

WidgetManager.register_widget_view = function (view_name, view_type) {
    /**
     * Registers a widget view by name.
     */
    return widgets.ManagerBase.register_widget_view.apply(this, arguments);
};

WidgetManager.set_state_callbacks = function (load_callback, save_callback, options) {
    /**
     * Registers callbacks for widget state persistence.
     *
     * Parameters
     * ----------
     * load_callback: function()
     *      function that is called when the widget manager state should be
     *      loaded.  This function should return a promise for the widget
     *      manager state.  An empty state is an empty dictionary `{}`.
     * save_callback: function(state as dictionary)
     *      function that is called when the notebook is saved or autosaved.
     *      The current state of the widget manager is passed in as the first
     *      argument.
     */
    WidgetManager._load_callback = load_callback;
    WidgetManager._save_callback = save_callback;
    WidgetManager._get_state_options = options || {};

    // Use the load callback to immediately load widget states.
    WidgetManager._managers.forEach(function(manager) {
        if (load_callback) {
            Promise.resolve().then(function () {
                return load_callback.call(manager);
            }).then(function(state) {
                manager.set_state(state);
            }).catch(widgets.reject('Error loading widget manager state', true));
        }
    });
};

var url = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
var key = 'widgets:' + url;
WidgetManager.set_state_callbacks(function() {
    if (Jupyter.notebook.metadata.widgets) {
        return Promise.resolve(Jupyter.notebook.metadata.widgets.state);
    } else {
        return Promise.resolve({});
    }
});

WidgetManager.prototype.loadClass = function(className, moduleName, moduleVersion, error) {
    if (moduleName === "jupyter-js-widgets") {
        if (className === "OutputModel" || className === "OutputView") {
            return Promise.resolve(output[className]);
        } else {
            return Promise.resolve(widgets[className]);
        }
    } else {
        return Object.getPrototypeOf(WidgetManager.prototype).loadClass.apply(this, arguments);
    }
}

WidgetManager.prototype._handle_display_view = function (view) {
    /**
     * Have the IPython keyboard manager disable its event
     * handling so the widget can capture keyboard input.
     * Note, this is only done on the outer most widgets.
     */
    if (this.keyboard_manager) {
        this.keyboard_manager.register_events(view.el);

        if (view.additional_elements) {
            for (var i = 0; i < view.additional_elements.length; i++) {
                this.keyboard_manager.register_events(view.additional_elements[i]);
            }
        }
    }
};

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
                    'application/vnd.jupyter.widget-state+json' : {
                        version_major: 1,
                        version_minor: 0,
                        state: state
                    }
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

    widgetsSubmenu.appendChild(this._createMenuItem('Save Notebook with Widgets', this.saveWidgetsAction));
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

WidgetManager.prototype.display_model = function(msg, model, options) {
    options = options || {};
    if (msg) {
        options.cell = this.get_msg_cell(msg.parent_header.msg_id);
        // Only set cell_index when view is displayed as directly.
        options.cell_index = this.notebook.find_cell_index(options.cell);
    } else if (options && options.cell_index !== undefined) {
        options.cell = this.notebook.get_cell(options.cell_index);
    } else {
        options.cell = null;
    }
    return widgets.ManagerBase.prototype.display_model.call(this, msg, model, options)
        .catch(widgets.reject('Could not display model', true));
};

// In display view
WidgetManager.prototype.display_view = function(msg, view, options) {
    if (options.cell === null) {
        view.remove();
        return Promise.reject(new Error("Could not determine where the display" +
            " message was from.  Widget will not be displayed"));
    } else {
        if (options.cell.widgetarea) {
            var that = this;
            return options.cell.widgetarea.display_widget_view(Promise.resolve(view)).then(function(view) {
                that._handle_display_view(view);
                return view;
            }).catch(widgets.reject('Could not display view', true));
        } else {
            return Promise.reject(new Error('Cell does not have a `widgetarea` defined'));
        }
    }
};

WidgetManager.prototype.setViewOptions = function (options) {
    var options = options || {};
    // If a view is passed into the method, use that view's cell as
    // the cell for the view that is created.
    if (options.parent !== undefined) {
        options.cell = options.parent.options.cell;
    }
    return options;
};

WidgetManager.prototype.get_msg_cell = function (msg_id) {
    var cell = null;
    // First, check to see if the msg was triggered by cell execution.
    if (this.notebook) {
        cell = this.notebook.get_msg_cell(msg_id);
    }
    if (cell !== null) {
        return cell;
    }
    // Second, check to see if a get_cell callback was defined
    // for the message.  get_cell callbacks are registered for
    // widget messages, so this block is actually checking to see if the
    // message was triggered by a widget.
    var kernel = this.comm_manager.kernel;
    if (kernel) {
        var callbacks = kernel.get_callbacks_for_msg(msg_id);
        if (callbacks && callbacks.iopub &&
            callbacks.iopub.get_cell !== undefined) {
            return callbacks.iopub.get_cell();
        }
    }

    // Not triggered by a cell or widget (no get_cell callback
    // exists).
    return null;
};

WidgetManager.prototype._create_comm = function(comm_target_name, model_id, data) {
    var that = this;
    return this._get_connected_kernel().then(function(kernel) {
        if (data) {
            return kernel.comm_manager.new_comm(comm_target_name, data,
                                                that.callbacks(), {}, model_id);
        } else {
            return new Promise(function(resolve) {
                requirejs(["services/kernels/comm"], function(comm) {
                    var new_comm = new comm.Comm(comm_target_name, model_id);
                    kernel.comm_manager.register_comm(new_comm);
                    resolve(new_comm);
                });
            });
        }
    });
};

WidgetManager.prototype.callbacks = function (view) {
    /**
     * callback handlers specific a view
     */
    var callbacks = {};
    if (view && view.options.cell) {

        // Try to get output handlers
        var cell = view.options.cell;
        var handle_output = null;
        var handle_clear_output = null;
        if (cell.output_area) {
            handle_output = _.bind(cell.output_area.handle_output, cell.output_area);
            handle_clear_output = _.bind(cell.output_area.handle_clear_output, cell.output_area);
        }

        // Create callback dictionary using what is known
        var that = this;
        callbacks = {
            iopub : {
                output : handle_output,
                clear_output : handle_clear_output,

                // Special function only registered by widget messages.
                // Allows us to get the cell for a message so we know
                // where to add widgets if the code requires it.
                get_cell : function () {
                    return cell;
                },
            },
        };
    }
    return callbacks;
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

module.exports = {
    WidgetManager: WidgetManager
};
