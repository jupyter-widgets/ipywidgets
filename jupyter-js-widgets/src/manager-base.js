// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('./utils');
var semver = require('semver');

//--------------------------------------------------------------------
// ManagerBase class
//--------------------------------------------------------------------
var ManagerBase = function() {
    /**
     * Public constructor
     */
    ManagerBase._managers.push(this);

    this.comm_target_name = 'jupyter.widget';
    this.version_comm_target_name = 'jupyter.widget.version';
    this._models = {}; /* Dictionary of model ids and model instance promises */
};

//--------------------------------------------------------------------
// Class level
//--------------------------------------------------------------------
ManagerBase._model_types = {}; /* Dictionary of model type names (target_name) and model types. */
ManagerBase._view_types = {}; /* Dictionary of view names and view types. */
ManagerBase._managers = []; /* List of widget managers */

// TODO: Remove me in ipywidgets 6.0
ManagerBase.register_widget_model = function (model_name, model_type) {
    /**
     * Registers a widget model by name.
     */
    console.warn('register_widget_model is deprecated.  Models and views should be linked to their backend counterparts using the require.js load path (see the `_view_module` and `_model_module` traits)');
    ManagerBase._model_types[model_name] = model_type;
};

// TODO: Remove me in ipywidgets 6.0
ManagerBase.register_widget_view = function (view_name, view_type) {
    /**
     * Registers a widget view by name.
     */
    console.warn('register_widget_view is deprecated.  Models and views should be linked to their backend counterparts using the require.js load path (see the `_view_module` and `_model_module` traits)');
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
    throw new Error('Manager.display_view not implemented');
};

ManagerBase.prototype.setViewOptions = function(options) {
    /**
     * Modifies view options. Generally overloaded in custom widget manager
     * implementations.
     */
    return options || {};
};

ManagerBase.prototype.require_error = function (success_callback) {
    /**
     * Takes a requirejs success handler and returns a requirejs error handler.
     * The default implementation just throws the original error.
     */
    return function(err) {
        throw err;
    };
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

        return utils.loadClass(
            model.get('_view_name'),
            model.get('_view_module'),
            ManagerBase._view_types,
            that.require_error
        ).then(function(ViewType) {
            var view = new ViewType({
                model: model,
                options: that.setViewOptions(options)
            });
            view.listenTo(model, 'destroy', view.remove);
            return Promise.resolve(view.render()).then(function() {
                return view;
            });
        }).catch(utils.reject('Could not create a view for model id ' + model.id, true));
    });
    var id = utils.uuid();
    model.views[id] = model.state_change;
    model.state_change.then(function(view) {
        view.once('remove', function() { delete view.model.views[id]; }, this);
    });
    return model.state_change;
};

ManagerBase.prototype.callbacks = function (view) {
    /**
     * callback handlers specific a view
     */
    return {};
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
        comm: comm
    }, msg.content.data).catch(utils.reject('Could not create a model.', true));
};

/**
 * Create a comm and new widget model.
 * @param  {Object} options - same options as new_model but, comm is not
 *                          required and additional options are available.
 * @param  {Object} serialized_state - serialized model attributes.
 * @return {Promise<WidgetModel>}
 */
ManagerBase.prototype.new_widget = function(options, serialized_state) {
    var commPromise;
    // If no comm is provided, a new comm is opened for the jupyter.widget
    // target.
    if (options.comm) {
        commPromise = Promise.resolve(options.comm);
    } else {
        commPromise = this._create_comm(
            this.comm_target_name,
            options.model_id,
            {
                widget_class: options.widget_class,
                target_name: 'jupyter.widget'
            }
        );
    }
    // The options dictionary is copied since data will be added to it.
    var options_clone = _.clone(options);
    // Create the model. In the case where the comm promise is rejected a
    // comm-less model is still created with the required model id.
    var that = this;
    return commPromise.then(function(comm) {
        // Comm Promise Resolved.
        options_clone.comm = comm;
        return that.new_model(options_clone, serialized_state);
    }, function() {
        // Comm Promise Rejected.
        if (!options_clone.model_id) {
            options_clone.model_id = utils.uuid();
        }
        return that.new_model(options_clone, serialized_state);
    });
};

/**
 * Validate the version of the Javascript against the version requested by
 * the backend.
 * @return {Promise<Boolean>} Whether or not the versions are okay
 */
ManagerBase.prototype.validateVersion = function() {
    return this._create_comm(this.version_comm_target_name, undefined, {}).then((function(comm) {
        return new Promise((function(resolve, reject) {
            comm.on_msg((function(msg) {
                var version = require('../package.json').version;
                var requirement = msg.content.data.version;
                var validated = semver.satisfies(version, requirement);
                comm.send({'validated': validated});
                if (validated) {
                    console.info('Widget backend and frontend versions are compatible');
                }
                resolve(validated);
            }).bind(this));
            setTimeout(function() {
                reject(new Error('Timeout while trying to cross validate the widget frontend and backend versions.'));
            }, 3000);
        }).bind(this));
    }).bind(this));
};

ManagerBase.prototype.new_model = function(options, serialized_state) {
    /**
     * Create and return a promise for a new widget model
     *
     * Minimally, one must provide the model_name and widget_class
     * parameters to create a model from Javascript.
     *
     * Example
     * --------
     * JS:
     * Jupyter.notebook.kernel.widget_manager.new_model({
     *      model_name: 'WidgetModel',
     *      widget_class: 'Jupyter.IntSlider'
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
     * serialized_state: dictionary
     *  Dictionary of the attribute values for the model.
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
        throw new Error('Neither comm nor model_id provided in options object. At least one must exist.');
    }

    var model_promise = utils.loadClass(options.model_name,
                                        options.model_module,
                                        ManagerBase._model_types,
                                        that.require_error)
        .then(function(ModelType) {
            return ModelType._deserialize_state(serialized_state || {}, that).then(function(attributes) {
                var widget_model = new ModelType(that, model_id, options.comm, attributes);
                widget_model.once('comm:close', function () {
                    delete that._models[model_id];
                });
                widget_model.name = options.model_name;
                widget_model.module = options.model_module;
                return widget_model;
            });
    }, function(error) {
        delete that._models[model_id];
        var wrapped_error = new utils.WrappedError('Could not create model', error);
        return Promise.reject(wrapped_error);
    });
    this._models[model_id] = model_promise;
    return model_promise;
};

/**

 * Close all widgets and empty the widget state.
 * @param  {boolean} commlessOnly should only commless widgets be removed
 * @return {Promise}              promise that resolves when the widget state is
 *                                cleared.
 */
ManagerBase.prototype.clear_state = function(commlessOnly) {
    var that = this;
    return utils.resolvePromisesDict(this._models).then(function(models) {
        Object.keys(models).forEach(function(id) {
            if (!commlessOnly || models[id].comm) {
                models[id].close();
            }
        });
        that._models = {};
    });
};

ManagerBase.prototype.get_state = function(options) {
    /**
     * Asynchronously get the state of the widget manager.
     *
     * This includes all of the widget models.
     *
     * Parameters
     * ----------
     * options: dictionary
     *  Dictionary of options with the following contents:
     *      only_displayed: (optional) boolean=false
     *          Only return models with one or more displayed views.
     *      not_live: (optional) boolean=false
     *          Include models that have comms with severed connections.
     *      drop_defaults: (optional) boolean=false
     *          Drop model attributed that are equal to their default values.
     *
     * Returns
     * -------
     * Promise for a state dictionary
     */
    var that = this;
    return utils.resolvePromisesDict(this._models).then(function(models) {
        var state = {};

        for (var model_id in models) {
            if (models.hasOwnProperty(model_id)) {
                var model = models[model_id];

                // If the model has one or more views defined for it,
                // consider it displayed.
                var displayed_flag = !(options && options.only_displayed) || Object.keys(model.views).length > 0;
                var live_flag = (options && options.not_live) || model.comm_live;
                if (displayed_flag && live_flag) {
                    state[model_id] = utils.resolvePromisesDict({
                        model_name: model.name,
                        model_module: model.module,
                        state: model.constructor._serialize_state(model.get_state(options.drop_defaults), that),
                        views: utils.resolvePromisesDict(model.views).then(function (views) {
                            return _.values(views).filter(function(view) {
                                    return view.options !== undefined && view.options.root;
                            }).map(function (view) {
                                return that.filterViewOptions(view.options);
                            });
                        })
                    });
                }
            }
        }
        return utils.resolvePromisesDict(state);
    }).catch(utils.reject('Could not get state of widget manager', true));
};

ManagerBase.prototype.filterViewOptions = function(options) {
    /**
     * Returns the keys of view options that must be stored in the serialized
     * widget manager state.
     *
     * This is meant to be overloaded in custom managers, which may register
     * the cell index.
     */
    return {};
};

ManagerBase.prototype.set_state = function(state, displayOptions) {
    /**
     * Set the widget manager state.
     *
     * Reconstructs all of the widget models in the state, merges that with the
     * current manager state, and then attempts to redisplay the widgets in the
     * state.
     */
    var that = this;

    // Recreate all the widget models for the given widget manager state.
    var all_models = that._get_comm_info().then(function(live_comms) {
        return Promise.all(_.map(Object.keys(state), function (model_id) {

            // If the model has already been created, set it's state and then
            // return it.
            if (that._models[model_id]) {
                return that._models[model_id].then(function(model) {
                    return model.constructor._deserialize_state(state[model_id].state || {}, that).then(function(attributes) {
                        model.set_state(attributes);
                        return model;
                    });
                });
            }

            if (live_comms.hasOwnProperty(model_id)) {  // live comm
                return that._create_comm(that.comm_target_name, model_id).then(function(new_comm) {
                    return that.new_model({
                        comm: new_comm,
                        model_name: state[model_id].model_name,
                        model_module: state[model_id].model_module
                    });
                });
            } else { // dead comm
                return that.new_model({
                    model_id: model_id,
                    model_name: state[model_id].model_name,
                    model_module: state[model_id].model_module
                }, state[model_id].state);
            }
        }));
    });

    // Display all the views
    return all_models.then(function(models) {
        return Promise.all(_.map(models, function(model) {
            // Display the views of the model.
            if (state[model.id] !== undefined) {
                // Display the model using the display options merged with the
                // options.
                if (displayOptions && displayOptions.displayOnce && state[model.id].views && state[model.id].views.length) {
                    return that.display_model(undefined, model, _.extend({}, displayOptions));
                } else {
                    // Display the model using the display options merged with the
                    // options.
                    return Promise.all(_.map(state[model.id].views, function(options) {
                        return that.display_model(undefined, model, _.extend({}, options, displayOptions));
                    }));
                }
            }
        }));
    }).catch(utils.reject('Could not set widget manager state.', true));
};

ManagerBase.prototype._create_comm = function(comm_target_name, model_id, data) {
    return Promise.reject('No backend.');
};

ManagerBase.prototype._get_comm_info = function() {
    return Promise.reject('No backend.');
};

module.exports = {
    ManagerBase: ManagerBase
};
