// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "underscore",
    "backbone",
    "./utils"
], function (_, Backbone, utils) {
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

    ManagerBase.prototype.loadClass = function(class_name, module_name, registry) {
        return utils.loadClass(class_name, module_name, registry);
    };

    ManagerBase.prototype.create_view = function(model, options) {
        /**
         * Creates a promise for a view of a given model
         *
         * Make sure the view creation is not out of order with
         * any state updates.
         */
        var that = this;
        model.state_change = model.state_change.then(function() {

            return that.loadClass(model.get('_view_name'), model.get('_view_module'),
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
     * @param  {Object} options - same options as new_model but, comm is not
     *                          needed and additional options are available:
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
            // Comm Promise Resolved.
            options_clone.comm = comm;
            return that.new_model(options_clone).then(function(model) {
                return model.request_state();
            });
        }, function() {
            // Comm Promise Rejected.
            if (!options_clone.model_id) {
                options_clone.model_id = utils.uuid();
            }
            return that.new_model(options_clone);
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
        var model_promise = this.loadClass(options.model_name,
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
        return utils.resolvePromisesDict(this._models).then(function(models) {
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
                            model_promises.push(utils.resolvePromisesDict(model.views).then(function(model_views) {
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

    /**
     * Create a style tag element in the current context.
     * @return {HTMLElement}
     */
    ManagerBase.prototype.createStyleTag = function() {
        var style = document.createElement('style');
        document.querySelectorAll('body')[0].appendChild(style);
        return style;
    };

    ManagerBase.prototype._create_comm = function(comm_target_name, model_id, metadata) {
        return Promise.reject("No backend.");
    };

    ManagerBase.prototype._get_comm_info = function() {
        return Promise.reject("No backend.");
    };

    return {
        'ManagerBase': ManagerBase
    };
});
