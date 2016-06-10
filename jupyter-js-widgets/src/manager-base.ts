// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as _ from 'underscore';
import * as utils from './utils';
import * as semver from 'semver';
import * as Backbone from 'backbone';
import * as services from 'jupyter-js-services';

import {
    WidgetModel
} from './widget';

import {
    shims
} from './services-shim';


/**
 * The options for a model.
 * 
 * #### Notes
 * Either a comm or a model_id must be provided.
 */
export
interface ModelOptions {
    /**
     * Target name of the widget model to create.
     */
    model_name: string;

    /**
     * Module name of the widget model to create.
     */
    model_module: string;

    /**
     * Target name of the widget in the back end.
     */
    widget_class?: string;

    /**
     * Comm object associated with the widget.
     */
    comm?: any;

    /**
     * The model id to use. If not provided, the comm id of the comm is used.
     */
    model_id?: string;
}

export
interface StateOptions {
    /**
     * Only return models with one or more displayed views.
     * 
     * @default false
     */
    only_displayed?: boolean;
    /**
     * Include models that have comms with severed connections.
     * 
     * @default false
     */
    not_live?: boolean;
    /**
     * Drop model attributes that are equal to their default value.
     * 
     * @default false
     */
    drop_defaults?: boolean;
}

/**
 * Manager abstract base class
 */
export
abstract class ManagerBase<T> {
    /**
     * The comm target name to register.
     */
    get comm_target_name(): string {
        return 'jupyter.widget';
    }

    /**
     * The version comm target name to register.
     */
    get version_comm_target_name(): string {
        return 'jupyter.widget.version';
    }

    /**
     * Display a view for a particular model.
     */
    display_model(msg: services.IKernelMessage, model: Backbone.Model, options: any): Promise<T> {
        options = options || {};
        options.root = true; // This element is at the root of the widget hierarchy.

        return this.create_view(model, options).then(_.bind(function(view) {
            return this.display_view(msg, view, options);
        }, this)).catch(utils.reject('Could not create view', true));
    };

    /**
     * Display a view.
     * 
     * #### Notes
     * This must be implemented by a subclass. The implementation must trigger the view's displayed
     * event after the view is on the page: `view.trigger('displayed')`
     */
    abstract display_view(msg: services.IKernelMessage, view: Backbone.View<Backbone.Model>, options: any): Promise<T>;

    /**
     * Modifies view options. Generally overloaded in custom widget manager
     * implementations.
     */
    setViewOptions(options) {
        return options || {};
    };

    /**
     * Takes a requirejs success handler and returns a requirejs error handler.
     * The default implementation just throws the original error.
     */
    require_error (success_callback) {
        return function(err) {
            throw err;
        };
    };

    /**
     * Creates a promise for a view of a given model
     *
     * Make sure the view creation is not out of order with
     * any state updates.
     */
    create_view(model, options) {
        var that = this;
        model.state_change = model.state_change.then(function() {

            return utils.loadClass(
                model.get('_view_name'),
                model.get('_view_module'),
                null,
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

    /**
     * callback handlers specific to a view
     */
    callbacks (view) {
        return {};
    };

    /**
     * Get a promise for a model by model id.
     */
    get_model(model_id: string): Promise<Backbone.Model> {
        return this._models[model_id];
    };

    /**
     * Handle when a comm is opened.
     */
    handle_comm_open(comm: shims.services.Comm, msg: services.IKernelIOPubCommOpenMessage): Promise<Backbone.Model> {
        return this.new_model({
            model_name: msg.content.data._model_name,
            model_module: msg.content.data._model_module,
            comm: comm
        }, msg.content.data).catch(utils.reject('Could not create a model.', true));
    };

    /**
     * Create a comm and new widget model.
     * @param  options - same options as new_model but, comm is not
     *                          required and additional options are available.
     * @param  serialized_state - serialized model attributes.
     */
    new_widget(options: ModelOptions, serialized_state: any): Promise<WidgetModel> {
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
     * @return Whether or not the versions are okay
     */
    validateVersion(): Promise<boolean> {
        return this._create_comm(this.version_comm_target_name, undefined, {}).then((function(comm) {
            return new Promise((function(resolve, reject) {
                comm.on_msg((function(msg) {
                    var version = (require('../package.json') as any).version;
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

    /**
     * Create and return a promise for a new widget model
     *
     * Minimally, one must provide the model_name and widget_class
     * parameters to create a model from Javascript.
     *
     * @param options - the options for creating the model.
     * @param serialized_state - attribute values for the model.
     * 
     * @example
     * widget_manager.new_model({
     *      model_name: 'WidgetModel',
     *      widget_class: 'Jupyter.IntSlider'
     *  })
     *  .then((model) => { console.log('Create success!', model); },
     *  (err) => {console.error(err)});
     *
     */
    new_model(options: ModelOptions, serialized_state: any = {}) {
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
                                            null,
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
    * @param commlessOnly should only commless widgets be removed
    * @return promise that resolves when the widget state is cleared.
    */
    clear_state(commlessOnly: boolean): Promise<void> {
        return utils.resolvePromisesDict(this._models).then((models) => {
            Object.keys(models).forEach((id) => {
                if (!commlessOnly || models[id].comm) {
                    models[id].close();
                }
            });
            this._models = {};
        });
    };

    /**
     * Asynchronously get the state of the widget manager.
     *
     * This includes all of the widget models.
     *
     * @param options - The options for what state to return.
     * @returns Promise for a state dictionary
     */
    get_state(options: StateOptions): Promise<any> {
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

    /**
     * Returns the keys of view options that must be stored in the serialized
     * widget manager state.
     *
     * This is meant to be overloaded in custom managers, which may register
     * the cell index.
     */
    filterViewOptions(options) {
        return {};
    };

    /**
     * Set the widget manager state.
     *
     * Reconstructs all of the widget models in the state, merges that with the
     * current manager state, and then attempts to redisplay the widgets in the
     * state.
     */
    set_state(state, displayOptions) {
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
        return all_models.then(function(models: Backbone.Model[]) {
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

    abstract _create_comm(comm_target_name, model_id, data?): Promise<any>;

    abstract _get_comm_info();

    /**
     * Dictionary of model ids and model instance promises 
     */
    private _models: any = Object.create(null);
}
