// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as _ from 'underscore';
import * as utils from './utils';
import * as semver from 'semver';
import * as Backbone from 'backbone';
import * as services from '@jupyterlab/services';

import {
    WidgetModel
} from './widget';

import {
    HTMLModel
} from './widget_string';

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
     * Semver version requirement for the model module.
     */
    model_module_version: string;

    /**
     * Target name of the widget view to create.
     */
    view_name?: string;

    /**
     * Module name of the widget view to create.
     */
    view_module?: string;

    /**
     * Semver version requirement for the view module.
     */
    view_module_version?: string;

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
     * Display a view for a particular model.
     */
    display_model(msg: services.KernelMessage.IMessage, model: Backbone.Model, options: any = {}): Promise<T> {
        return this.create_view(model, options).then(
            view => this.display_view(msg, view, options)).catch(utils.reject('Could not create view', true));
    };

    /**
     * Display a view.
     *
     * #### Notes
     * This must be implemented by a subclass. The implementation must trigger the view's displayed
     * event after the view is on the page: `view.trigger('displayed')`
     */
    abstract display_view(msg: services.KernelMessage.IMessage, view: Backbone.View<Backbone.Model>, options: any): Promise<T>;

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
    require_error (success_callback, failure_callback, version: string) {
        return failure_callback;
    };

    /**
     * Creates a promise for a view of a given model
     *
     * Make sure the view creation is not out of order with
     * any state updates.
     */
    create_view(model, options) {
        model.state_change = model.state_change.then(() => {

            return this.loadClass(
                model.get('_view_name'),
                model.get('_view_module'),
                model.get('_view_module_version'),
                this.require_error
            ).then((ViewType) => {
                var view = new ViewType({
                    model: model,
                    options: this.setViewOptions(options)
                });
                view.listenTo(model, 'destroy', view.remove);
                return Promise.resolve(view.render()).then(() => {return view;});
            }).catch(utils.reject('Could not create a view for model id ' + model.id, true));
        });
        var id = utils.uuid();
        model.views[id] = model.state_change;
        model.state_change.then((view) => {
            view.once('remove', () => { delete view.model.views[id]; }, this);
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
        // Perhaps we should return a Promise.reject if the model is not found.
        return this._models[model_id];
    };

    /**
     * Handle when a comm is opened.
     */
    handle_comm_open(comm: shims.services.Comm, msg: services.KernelMessage.ICommOpenMsg): Promise<Backbone.Model> {
        var data = (msg.content.data as any);
        utils.put_buffers(data.state, data.buffer_paths, msg.buffers)
        return this.new_model({
            model_name: data.state['_model_name'],
            model_module: data.state['_model_module'],
            model_module_version: data.state['_model_module_version'],
            comm: comm
        }, data.state).catch(utils.reject('Could not create a model.', true));
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
                    state: {
                            _model_module: options.model_module,
                            _model_module_version: options.model_module_version,
                            _model_name: options.model_name,
                            _view_module: options.view_module,
                            _view_module_version: options.view_module_version,
                            _view_name: options.view_name
                        },
                }
            );
        }
        // The options dictionary is copied since data will be added to it.
        var options_clone = _.clone(options);
        // Create the model. In the case where the comm promise is rejected a
        // comm-less model is still created with the required model id.
        return commPromise.then((comm) => {
            // Comm Promise Resolved.
            options_clone.comm = comm;
            let widget_model = this.new_model(options_clone, serialized_state);
            return widget_model.then(model => {
                model.sync('create', model);
                return model;
            });
        }, () => {
            // Comm Promise Rejected.
            if (!options_clone.model_id) {
                options_clone.model_id = utils.uuid();
            }
            return this.new_model(options_clone, serialized_state);
        });
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

        var error_handler = function(error) {
            let modelOptions = {
                widget_manager: that,
                model_id: model_id,
                comm: options.comm,
            }
            var widget_model = new HTMLModel({}, modelOptions);
            widget_model.once('comm:close', function () {
                delete that._models[model_id];
            });
            let placeholder =
                `<table style="width:100%">
                <thead>
                    <tr>
                        <th colspan="2">
                        Could not create model:
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Model name</td>
                        <td> ${options.model_name} </td>
                    </tr>
                    <tr>
                        <td>Model module</td>
                        <td> ${options.model_module} </td>
                    </tr>
                    <tr>
                        <td>Model module version</td>
                        <td> ${options.model_module_version} </td>
                    </tr>
                <tbody>
                <tfoot>
                    <tr>
                        <th colspan="2">
                        ${error.message}
                        </th>
                    </tr>
                </tfoot>
                </table>`;
            widget_model.set('value', placeholder);
            return widget_model;
        };

        var model_promise = this.loadClass(options.model_name,
                                           options.model_module,
                                           options.model_module_version,
                                           that.require_error)
        .then(function(ModelType) {
            try {
                return ModelType._deserialize_state(serialized_state || {}, that)
                .then(function(attributes) {
                    let modelOptions = {
                        widget_manager: that,
                        model_id: model_id,
                        comm: options.comm,
                    }
                    var widget_model = new ModelType(attributes, modelOptions);
                    widget_model.once('comm:close', function () {
                        delete that._models[model_id];
                    });
                    widget_model.name = options.model_name;
                    widget_model.module = options.model_module;
                    return widget_model;
                });
            }
            catch (error) {
                error_handler(error);  // error handler call if ModelType is undefined.
            }
        }, error_handler);             // error handler call if module cannot be loaded.

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
        return utils.resolvePromisesDict(this._models).then((models) => {
            let state = {};
            Object.keys(models).forEach(model_id => {
                let model = models[model_id];
                state[model_id] = {
                    model_name: model.name,
                    model_module: model.module,
                    model_module_version: model.get('_model_module_version'),
                    state: model.serialize(model.get_state(options.drop_defaults))
                };
            });
            return state;
        }).catch(utils.reject('Could not get state of widget manager', true));
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
                            model_module: state[model_id].model_module,
                            model_module_version: state[model_id].model_module_version
                        });
                    });
                } else {                                    // dead comm
                    return that.new_model({
                        model_id: model_id,
                        model_name: state[model_id].model_name,
                        model_module: state[model_id].model_module,
                        model_module_version: state[model_id].model_module_version
                    }, state[model_id].state);
                }
            }));
        });

        return all_models;
    };

    /**
     * Load a class and return a promise to the loaded object.
     */
    protected loadClass(className, moduleName, moduleVersion, error) {
        return utils.loadClass(className, moduleName, moduleVersion, null, error);
    }

    abstract _create_comm(comm_target_name, model_id, data?): Promise<any>;

    abstract _get_comm_info();

    /**
     * Dictionary of model ids and model instance promises
     */
    private _models: any = Object.create(null);
}
