// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "underscore",
    "backbone",
    "services/kernels/comm",
    "jupyter-js-widgets"
], function (_, Backbone, comm, widgets) {
    "use strict";

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

        // Attempt to reconstruct any live comms by requesting them from the
        // back-end.
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
                            // it's a state update.  If so, resolve.
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
                        comm: widget_info.comm,
                    }).then(function(model) {
                        return model._handle_comm_msg(widget_info.msg).then(function() {
                            return model.id;
                        });
                    });
                }));
            }).then(function(model_ids) {

                // Load the initial state of the widget manager if a load callback was
                // registered.
                if (WidgetManager._load_callback) {
                    Promise.resolve().then(function () {
                        return WidgetManager._load_callback.call(that);
                    }).then(function(state) {
                        that.set_state(state);
                    }).catch(widgets.reject('Error loading widget manager state', true));
                }
            });
        });

        // Setup state saving code.
        this.notebook.events.on('before_save.Notebook', function() {
            var save_callback = WidgetManager._save_callback;
            var options = WidgetManager._get_state_options;
            if (save_callback) {
                that.get_state(options).then(function(state) {
                    save_callback.call(that, state);
                }).catch(widgets.reject('Could not call widget save state callback.', true));
            }
        });

        // Validate the version requested by the backend.
        var validate = (function validate() {
            this.validateVersion().then(function(valid) {
                if (!valid) {
                    console.warn('Widget frontend version does not match the backend.');
                }
            }).catch(function(err) {
                console.error('Could not cross validate the widget frontend and backend versions.', err);
            });
        }).bind(this);
        validate();
        
        // Revalidate the version when a new kernel connects.
        this.notebook.events.on('kernel_connected.Kernel', function(event, data) {
            validate();
        });
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
        WidgetManager._get_state_options = options;

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

    // Use local storage to persist widgets across page refresh by default.
    // LocalStorage is per domain, so we need to explicitly set the URL
    // that the widgets are associated with so they don't show on other
    // pages hosted by the noteboook server.
    var url = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    var key = 'widgets:' + url;
    WidgetManager.set_state_callbacks(function() {
        if (localStorage[key]) {
            return JSON.parse(localStorage[key]);
        }
        return {};
    }, function(state) {
        localStorage[key] = JSON.stringify(state);
    });

    WidgetManager.prototype._handle_display_view = function (view) {
        /**
         * Have the IPython keyboard manager disable its event
         * handling so the widget can capture keyboard input.
         * Note, this is only done on the outer most widgets.
         */
        view.trigger('displayed');

        if (this.keyboard_manager) {
            this.keyboard_manager.register_events(view.el);

            if (view.additional_elements) {
                for (var i = 0; i < view.additional_elements.length; i++) {
                    this.keyboard_manager.register_events(view.additional_elements[i]);
                }
            }
        }
    };

    WidgetManager.prototype.display_model = function(msg, model, options) {
        options = options || {};
        if (msg) {
            var cell = this.get_msg_cell(msg.parent_header.msg_id);
            if (cell === null) {
                return Promise.reject(new Error("Could not determine where the display" +
                    " message was from.  Widget will not be displayed"));
            } else {
                options.cell = cell; // TODO: Handle in get state
                // Only set cell_index when view is displayed as directly.
                options.cell_index = this.notebook.find_cell_index(cell);

                return widgets.ManagerBase.prototype.display_model.call(this, msg, model, options)
                    .catch(widgets.reject('Could not display model', true));
            }
        } else if (options && options.cell_index !== undefined) {
            options.cell = this.notebook.get_cell(options.cell_index);
            return widgets.ManagerBase.prototype.display_model.call(this, msg, model, options)
                .catch(widgets.reject('Could not display model', true));
        } else {
            return Promise.reject(new Error("Could not determine which cell the " +
            "widget belongs to.  Widget will not be displayed"));
        }
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

    WidgetManager.prototype._create_comm = function(comm_target_name, model_id, metadata) {
        return this._get_connected_kernel().then(function(kernel) {
            if (metadata) {
                return kernel.comm_manager.new_comm(comm_target_name, metadata, model_id);
            } else {
                var new_comm = new comm.Comm(comm_target_name, model_id);
                kernel.comm_manager.register_comm(new_comm);
                return new_comm;
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

    return {
        WidgetManager: WidgetManager
    };
});
