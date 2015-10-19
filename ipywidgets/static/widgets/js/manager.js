// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "underscore",
    "backbone",
    "base/js/utils",
    "base/js/namespace",
    "services/kernels/comm"
], function (_, Backbone, utils, IPython, comm) {
    "use strict";
    //--------------------------------------------------------------------
    // ManagerBase class
    //--------------------------------------------------------------------
    var ManagerBase = function() {
        /**
         * Public constructor
         */
        ManagerBase._managers.push(this);
        
        this.comm_target_name = 'ipython.widget';
        this._models = {}; /* Dictionary of model ids and model instance promises */
    };

    //--------------------------------------------------------------------
    // Class level
    //--------------------------------------------------------------------
    ManagerBase._model_types = {}; /* Dictionary of model type names (target_name) and model types. */
    ManagerBase._view_types = {}; /* Dictionary of view names and view types. */
    ManagerBase._managers = []; /* List of widget managers */

    ManagerBase.register_widget_model = function (model_name, model_type) {
        /**
         * Registers a widget model by name.
         */
        ManagerBase._model_types[model_name] = model_type;
    };

    ManagerBase.register_widget_view = function (view_name, view_type) {
        /**
         * Registers a widget view by name.
         */
        ManagerBase._view_types[view_name] = view_type;
    };
    
    //--------------------------------------------------------------------
    // Instance level
    //--------------------------------------------------------------------
    ManagerBase.prototype.display_model = function(msg, model, options) {
        /**
         * Displays a view for a particular model.
         */
        options = options || {};
        options.root = true; // This element is being displayed not as a child of another.
        
        return this.create_view(model, options).then(_.bind(function(view) {
            return this.display_view(msg, view, options);
        }, this)).catch(utils.reject('Could not create view', true));
    };
    
    ManagerBase.prototype.display_view = function(msg, view, options) {
        throw new Error("Manager.display_view not implemented");
    };

    ManagerBase.prototype.create_view = function(model, options) {
        /**
         * Creates a promise for a view of a given model
         *
         * Make sure the view creation is not out of order with
         * any state updates.
         */
        model.state_change = model.state_change.then(function() {

            return utils.load_class(model.get('_view_name'), model.get('_view_module'),
            ManagerBase._view_types).then(function(ViewType) {

                // If a view is passed into the method, use that view's cell as
                // the cell for the view that is created.
                options = options || {};
                if (options.parent !== undefined) {
                    options.cell = options.parent.options.cell;
                }
                // Create and render the view...
                var parameters = {model: model, options: options};
                var view = new ViewType(parameters);
                view.listenTo(model, 'destroy', view.remove);
                return Promise.resolve(view.render()).then(function() {return view;});
            }).catch(utils.reject("Couldn't create a view for model id '" + String(model.id) + "'", true));
        });
        var id = utils.uuid();
        model.views[id] = model.state_change;
        model.state_change.then(function(view) {
            view.once('remove', function() {
                delete view.model.views[id];
            }, this);
        });
        return model.state_change;
    };

    ManagerBase.prototype.callbacks = function (view) {
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

    ManagerBase.prototype.get_model = function (model_id) {
        /**
         * Get a promise for a model by model id.
         */
        return this._models[model_id];
    };

    ManagerBase.prototype.handle_comm_open = function (comm, msg) {
        /**
         * Handle when a comm is opened.
         */
        return this.new_model({
            model_name: msg.content.data._model_name,
            model_module: msg.content.data._model_module,
            comm: comm,
        }).then(function(model) {
            return model._deserialize_state(msg.content.data).then(function(state) {
                model.set_state(state);
                return model;
            });
        }).catch(utils.reject("Couldn't create a model.", true));
    };

    /**
     * Create a comm and new widget model.
     * @param  {Object} options - see new_model
     * @return {Promise<WidgetModel>}
     */
    ManagerBase.prototype.new_widget = function(options) {
        var commPromise;
        if (options.comm) {
            commPromise = Promise.resolve(options.comm);
        } else {
            commPromise = this._create_comm(this.comm_target_name,
                                            options.model_id, {
                'widget_class': options.widget_class,
                'target_name': 'ipython.widget',
            });
        }
        
        var options_clone = _.clone(options);
        var that = this;
        return commPromise.then(function(comm) {
            options_clone.comm = comm;
            return that.new_model(options_clone).then(function(model) {
                // Requesting the state to populate default values.
                return model.request_state();
            });
        });
    };

    ManagerBase.prototype.new_model = function(options) {
        /**
         * Create and return a promise for a new widget model
         *
         * Minimally, one must provide the model_name and widget_class
         * parameters to create a model from Javascript.
         *
         * Example
         * --------
         * JS:
         * IPython.notebook.kernel.widget_manager.new_model({
         *      model_name: 'WidgetModel',
         *      widget_class: 'ipywidgets.IntSlider'
         *  })
         *  .then(function(model) { console.log('Create success!', model); },
         *  _.bind(console.error, console));
         *
         * Parameters
         * ----------
         * options: dictionary
         *  Dictionary of options with the following contents:
         *      model_name: string
         *          Target name of the widget model to create.
         *      model_module: (optional) string
         *          Module name of the widget model to create.
         *      widget_class: (optional) string
         *          Target name of the widget in the back-end.
         *      comm: (optional) Comm
         *           Comm object associated with the widget.
         *      model_id: (optional) string
         *           If not provided, the comm id is used.
         *
         * Either a comm or a model_id must be provided.
         */
        var that = this;
        var model_id;
        if (options.model_id) {
            model_id = options.model_id;
        } else if (options.comm) {
            model_id = options.comm.comm_id;
        } else {
            throw new Error('Neither comm nor model_id provided in options object.  Atleast one must exist.');
        }
        var model_promise = utils.load_class(options.model_name,
                                             options.model_module,
                                             ManagerBase._model_types)
            .then(function(ModelType) {
                var widget_model = new ModelType(that, model_id, options.comm);
                widget_model.once('comm:close', function () {
                    delete that._models[model_id];
                });
                widget_model.name = options.model_name;
                widget_model.module = options.model_module;
                return widget_model;

            }, function(error) {
                delete that._models[model_id];
                var wrapped_error = new utils.WrappedError("Couldn't create model", error);
                return Promise.reject(wrapped_error);
            });
        this._models[model_id] = model_promise;
        return model_promise;
    };

    ManagerBase.prototype.get_state = function(options) {
        /**
         * Asynchronously get the state of the widget manager.
         *
         * This includes all of the widget models and the cells that they are
         * displayed in.
         *
         * Parameters
         * ----------
         * options: dictionary
         *  Dictionary of options with the following contents:
         *      only_displayed: (optional) boolean=false
         *          Only return models with one or more displayed views.
         *      not_live: (optional) boolean=false
         *          Include models that have comms with severed connections.
         *
         * Returns
         * -------
         * Promise for a state dictionary
         */
        var that = this;
        return utils.resolve_promises_dict(this._models).then(function(models) {
            var state = {};

            var model_promises = [];
            for (var model_id in models) {
                if (models.hasOwnProperty(model_id)) {
                    var model = models[model_id];

                    // If the model has one or more views defined for it,
                    // consider it displayed.
                    var displayed_flag = !(options && options.only_displayed) || Object.keys(model.views).length > 0;
                    var live_flag = (options && options.not_live) || model.comm_live;
                    if (displayed_flag && live_flag) {
                        state[model_id] = {
                            model_name: model.name,
                            model_module: model.module,
                            state: model.get_state(),
                            views: [],
                        };

                        // Get the views that are displayed *now*.
                        (function(local_state) {
                            model_promises.push(utils.resolve_promises_dict(model.views).then(function(model_views) {
                                for (var id in model_views) {
                                    if (model_views.hasOwnProperty(id)) {
                                        var view = model_views[id];
                                        if (view.options !== undefined && view.options.root) {
                                            local_state.views.push(view.options);
                                        }
                                    }
                                }
                            }));
                        })(state[model_id]);
                    }
                }
            }
            return Promise.all(model_promises).then(function() { return state; });
        }).catch(utils.reject('Could not get state of widget manager', true));
    };

    ManagerBase.prototype.set_state = function(state) {
        /**
         * Set the notebook's state.
         *
         * Reconstructs all of the widget models and attempts to redisplay the
         * widgets in the appropriate cells by cell index.
         */
        var that = this;

        // Recreate all the widget models for the given notebook state.
        var all_models = that._get_comm_info().then(function(live_comms) {
            return Promise.all(_.map(Object.keys(state), function (model_id) {
                
                // If the model has already been created, return it.
                if (that._models[model_id]) {
                    return that._models[model_id];
                }
                
                if (live_comms.hasOwnProperty(model_id)) {  // live comm
                    return that._create_comm(that.comm_target_name, model_id).then(function(new_comm) {
                        return that.new_model({
                            comm: new_comm,
                            model_name: state[model_id].model_name,
                            model_module: state[model_id].model_module,
                        }).then(function(model) {
                            // Request the state from the backend
                            return model.request_state();
                        });
                    });
                } else { // dead comm
                    return that.new_model({
                        model_id: model_id,
                        model_name: state[model_id].model_name,
                        model_module: state[model_id].model_module,
                    }).then(function(model) {
                        return model._deserialize_state(state[model_id].state).then(function(state) {
                            model.set_state(state);
                            return model;
                        });
                    });
                }
            }));
        });

        // Display all the views
        return all_models.then(function(models) {
            return Promise.all(_.map(models, function(model) {
                // Display the views of the model.
                return Promise.all(_.map(state[model.id].views, function(options) {
                    return that.display_model(undefined, model, options);
                }));
            }));
        }).catch(utils.reject('Could not set widget manager state.', true));
    };

    ManagerBase.prototype._create_comm = function(comm_target_name, model_id, metadata) {
        throw new Error("Manager._create_comm not implemented");
    };

    ManagerBase.prototype._get_comm_info = function() {
        throw new Error("Manager._get_comm_info not implemented");
    };
    
    //--------------------------------------------------------------------
    // WidgetManager class
    //--------------------------------------------------------------------
    var WidgetManager = function (comm_manager, notebook) {
        ManagerBase.apply(this);
        WidgetManager._managers.push(this);

        // Attach a comm manager to the
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
                    }).catch(utils.reject('Error loading widget manager state', true));
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
                }).catch(utils.reject('Could not call widget save state callback.', true));
            }
        });
    };
    WidgetManager.prototype = Object.create(ManagerBase.prototype);
    
    WidgetManager._managers = []; /* List of widget managers */
    WidgetManager._load_callback = null;
    WidgetManager._save_callback = null;
    
    
    WidgetManager.register_widget_model = function (model_name, model_type) {
        /**
         * Registers a widget model by name.
         */
        return ManagerBase.register_widget_model.apply(this, arguments);
    };

    WidgetManager.register_widget_view = function (view_name, view_type) {
        /**
         * Registers a widget view by name.
         */
        return ManagerBase.register_widget_view.apply(this, arguments);
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
                }).catch(utils.reject('Error loading widget manager state', true));
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

    /**
     * Deprecated, use `new_widget` instead.
     */
    WidgetManager.prototype.create_model = function (options) {
        console.warn('WidgetManager.create_model is deprecated. Use ManagerBase.new_widget');
        return this.new_widget(options);
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
                
                return ManagerBase.prototype.display_model.call(this, msg, model, options)
                    .catch(utils.reject('Could not display model', true));
            }
        } else if (options && options.cell_index !== undefined) {
            options.cell = this.notebook.get_cell(options.cell_index);
            return ManagerBase.prototype.display_model.call(this, msg, model, options)
                .catch(utils.reject('Could not display model', true));
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
                }).catch(utils.reject('Could not display view', true));
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
         * Gets a promise for the open comms in the backend
         */

        // Version using the comm_list_[request/reply] shell message.
        /*var that = this;
        return new Promise(function(resolve, reject) {
             kernel.comm_info(function(msg) {
                 resolve(msg['content']['comms']);
             });
        });*/

        // Workaround for absence of comm_list_[request/reply] shell message.
        // Create a new widget that gives the comm list and commits suicide.
        var that = this;
        return this._get_connected_kernel().then(function(kernel) {
            return new Promise(function(resolve, reject) {
                var comm = kernel.comm_manager.new_comm('ipython.widget',
                                    {'widget_class': 'ipywidgets.CommInfo'},
                                    'comm_info');
                comm.on_msg(function(msg) {
                    var data = msg.content.data;
                    if (data.content && data.method === 'custom') {
                        resolve(data.content.comms);
                    }
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
    
    // Backwards compatibility.
    IPython.WidgetManager = WidgetManager;

    return {
        'ManagerBase': ManagerBase,
        'WidgetManager': WidgetManager,
    };
});
