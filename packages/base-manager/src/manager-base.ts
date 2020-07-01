// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as services from '@jupyterlab/services';

import { JSONObject, PartialJSONObject } from '@lumino/coreutils';

import {
  DOMWidgetView,
  WidgetModel,
  WidgetView,
  DOMWidgetModel,
  IClassicComm,
  ICallbacks,
  put_buffers,
  remove_buffers,
  resolvePromisesDict,
  ISerializedState,
  reject,
  uuid,
  PROTOCOL_VERSION,
  IWidgetManager,
  IModelOptions,
  IWidgetOptions
} from '@jupyter-widgets/base';

import { base64ToBuffer, bufferToBase64, hexToBuffer } from './utils';
import { removeMath, replaceMath } from './latex';
import sanitize from 'sanitize-html';

const PROTOCOL_MAJOR_VERSION = PROTOCOL_VERSION.split('.', 1)[0];

/**
 * Strip unwanted tags from plaintext descriptions.
 */
function default_plaintext_sanitize(s: string): string {
  return sanitize(s, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

/**
 * Sanitize HTML-formatted descriptions.
 */
function default_inline_sanitize(s: string): string {
  const allowedTags = [
    'a',
    'abbr',
    'b',
    'code',
    'em',
    'i',
    'img',
    'li',
    'ol',
    'span',
    'strong',
    'style',
    'ul'
  ];
  const allowedAttributes = {
    '*': ['aria-*', 'style', 'title'],
    a: ['href'],
    img: ['src'],
    style: ['media', 'type']
  };
  return sanitize(s, {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes
  });
}

export interface IState extends PartialJSONObject {
  buffers?: IBase64Buffers[];
  model_name: string;
  model_module: string;
  model_module_version: string;
  state: JSONObject;
}

export interface IManagerStateMap extends PartialJSONObject {
  [key: string]: IState;
}

export interface IManagerState extends PartialJSONObject {
  version_major: number;
  version_minor: number;
  state: IManagerStateMap;
}

export interface IBase64Buffers extends PartialJSONObject {
  data: string;
  path: (string | number)[];
  encoding: 'base64';
}

/**
 * Manager abstract base class
 */
export abstract class ManagerBase implements IWidgetManager {
  /**
   * Modifies view options. Generally overloaded in custom widget manager
   * implementations.
   */
  setViewOptions(options: any = {}): any {
    return options;
  }

  /**
   * Creates a promise for a view of a given model
   *
   * #### Notes
   * The implementation must trigger the Lumino 'after-attach' and 'after-show' events when appropriate, which in turn will trigger the view's 'displayed' events.
   *
   * Make sure the view creation is not out of order with
   * any state updates.
   *
   */
  create_view<VT extends DOMWidgetView = DOMWidgetView>(
    model: DOMWidgetModel,
    options?: any
  ): Promise<VT>;
  create_view<VT extends WidgetView = WidgetView>(
    model: WidgetModel,
    options?: any
  ): Promise<VT>;
  create_view<VT extends WidgetView = WidgetView>(
    model: WidgetModel,
    options = {}
  ): Promise<VT> {
    const id = uuid();
    const viewPromise = (model.state_change = model.state_change.then(
      async () => {
        try {
          const ViewType = (await this.loadClass(
            model.get('_view_name'),
            model.get('_view_module'),
            model.get('_view_module_version')
          )) as typeof WidgetView;
          const view = new ViewType({
            model: model,
            options: this.setViewOptions(options)
          });
          view.listenTo(model, 'destroy', view.remove);
          await view.render();

          // This presumes the view is added to the list of model views below
          view.once('remove', () => {
            delete model.views[id];
          });

          return view;
        } catch (e) {
          console.error(
            `Could not create a view for model id ${model.model_id}`
          );
          throw e;
        }
      }
    ));
    model.views[id] = viewPromise;
    return viewPromise;
  }

  /**
   * callback handlers specific to a view
   */
  callbacks(view?: WidgetView): ICallbacks {
    return {};
  }

  /**
   * Get a promise for a model by model id.
   *
   * #### Notes
   * If a model is not found, undefined is returned (NOT a promise). However,
   * the calling code should also deal with the case where a rejected promise
   * is returned, and should treat that also as a model not found.
   */
  get_model(model_id: string): Promise<WidgetModel> | undefined {
    // TODO: Perhaps we should return a Promise.reject if the model is not
    // found. Right now this isn't a true async function because it doesn't
    // always return a promise.
    return this._models[model_id];
  }

  /**
   * Handle when a comm is opened.
   */
  handle_comm_open(
    comm: IClassicComm,
    msg: services.KernelMessage.ICommOpenMsg
  ): Promise<WidgetModel> {
    const protocolVersion = ((msg.metadata || {})['version'] as string) || '';
    if (protocolVersion.split('.', 1)[0] !== PROTOCOL_MAJOR_VERSION) {
      const error = `Wrong widget protocol version: received protocol version '${protocolVersion}', but was expecting major version '${PROTOCOL_MAJOR_VERSION}'`;
      console.error(error);
      return Promise.reject(error);
    }
    const data = (msg.content.data as unknown) as ISerializedState;
    const buffer_paths = data.buffer_paths || [];
    // Make sure the buffers are DataViews
    const buffers = (msg.buffers || []).map(b => {
      if (b instanceof DataView) {
        return b;
      } else {
        return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
      }
    });
    put_buffers(data.state, buffer_paths, buffers);
    return this.new_model(
      {
        model_name: data.state['_model_name'] as string,
        model_module: data.state['_model_module'] as string,
        model_module_version: data.state['_model_module_version'] as string,
        comm: comm
      },
      data.state
    ).catch(reject('Could not create a model.', true));
  }

  /**
   * Create a comm and new widget model.
   * @param  options - same options as new_model but comm is not
   *                          required and additional options are available.
   * @param  serialized_state - serialized model attributes.
   */
  new_widget(
    options: IWidgetOptions,
    serialized_state: JSONObject = {}
  ): Promise<WidgetModel> {
    let commPromise;
    // we check to make sure the view information is provided, to help catch
    // backwards incompatibility errors.
    if (
      options.view_name === undefined ||
      options.view_module === undefined ||
      options.view_module_version === undefined
    ) {
      return Promise.reject(
        'new_widget(...) must be given view information in the options.'
      );
    }
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
          }
        },
        { version: PROTOCOL_VERSION }
      );
    }
    // The options dictionary is copied since data will be added to it.
    const options_clone = { ...options };
    // Create the model. In the case where the comm promise is rejected a
    // comm-less model is still created with the required model id.
    return commPromise.then(
      comm => {
        // Comm Promise Resolved.
        options_clone.comm = comm;
        const widget_model = this.new_model(options_clone, serialized_state);
        return widget_model.then(model => {
          model.sync('create', model);
          return model;
        });
      },
      () => {
        // Comm Promise Rejected.
        if (!options_clone.model_id) {
          options_clone.model_id = uuid();
        }
        return this.new_model(options_clone, serialized_state);
      }
    );
  }

  register_model(model_id: string, modelPromise: Promise<WidgetModel>): void {
    this._models[model_id] = modelPromise;
    modelPromise.then(model => {
      model.once('comm:close', () => {
        delete this._models[model_id];
      });
    });
  }

  /**
   * Create and return a promise for a new widget model
   *
   * @param options - the options for creating the model.
   * @param serialized_state - attribute values for the model.
   *
   * @example
   * widget_manager.new_model({
   *      model_name: 'IntSlider',
   *      model_module: '@jupyter-widgets/controls',
   *      model_module_version: '1.0.0',
   *      model_id: 'u-u-i-d'
   * }).then((model) => { console.log('Create success!', model); },
   *  (err) => {console.error(err)});
   *
   */
  async new_model(
    options: IModelOptions,
    serialized_state: any = {}
  ): Promise<WidgetModel> {
    let model_id;
    if (options.model_id) {
      model_id = options.model_id;
    } else if (options.comm) {
      model_id = options.model_id = options.comm.comm_id;
    } else {
      throw new Error(
        'Neither comm nor model_id provided in options object. At least one must exist.'
      );
    }

    const modelPromise = this._make_model(options, serialized_state);
    // this call needs to happen before the first `await`, see note in `set_state`:
    this.register_model(model_id, modelPromise);
    return await modelPromise;
  }

  async _make_model(
    options: IModelOptions,
    serialized_state: any = {}
  ): Promise<WidgetModel> {
    const model_id = options.model_id;
    const model_promise = this.loadClass(
      options.model_name,
      options.model_module,
      options.model_module_version
    ) as Promise<typeof WidgetModel>;
    let ModelType: typeof WidgetModel;
    try {
      ModelType = await model_promise;
    } catch (error) {
      console.error('Could not instantiate widget');
      throw error;
    }

    if (!ModelType) {
      throw new Error(
        `Cannot find model module ${options.model_module}@${options.model_module_version}, ${options.model_name}`
      );
    }

    const attributes = await ModelType._deserialize_state(
      serialized_state,
      this
    );
    const modelOptions = {
      widget_manager: this,
      model_id: model_id,
      comm: options.comm
    };
    const widget_model = new ModelType(attributes, modelOptions);
    widget_model.name = options.model_name;
    widget_model.module = options.model_module;
    return widget_model;
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  clear_state(): Promise<void> {
    return resolvePromisesDict(this._models).then(models => {
      Object.keys(models).forEach(id => models[id].close());
      this._models = Object.create(null);
    });
  }

  /**
   * Asynchronously get the state of the widget manager.
   *
   * This includes all of the widget models, and follows the format given in
   * the @jupyter-widgets/schema package.
   *
   * @param options - The options for what state to return.
   * @returns Promise for a state dictionary
   */
  get_state(options: IStateOptions = {}): Promise<IManagerState> {
    const modelPromises = Object.keys(this._models).map(id => this._models[id]);
    return Promise.all(modelPromises).then(models => {
      return serialize_state(models, options);
    });
  }

  /**
   * Set the widget manager state.
   *
   * @param state - a Javascript object conforming to the application/vnd.jupyter.widget-state+json spec.
   *
   * Reconstructs all of the widget models in the state, merges that with the
   * current manager state, and then attempts to redisplay the widgets in the
   * state.
   */
  set_state(state: IManagerState): Promise<WidgetModel[]> {
    // Check to make sure that it's the same version we are parsing.
    if (!(state.version_major && state.version_major <= 2)) {
      throw 'Unsupported widget state format';
    }
    const models = state.state as any;
    // Recreate all the widget models for the given widget manager state.
    const all_models = this._get_comm_info().then(live_comms => {
      /* Note: It is currently safe to just loop over the models in any order,
               given that the following holds (does at the time of writing):
               1: any call to `new_model` with state registers the model promise (e.g. with `register_model`)
                  synchronously (before it's first `await` statement).
               2: any calls to a model constructor or the `set_state` method on a model,
                  happens asynchronously (in a `then` clause, or after an `await` statement).

              Without these assumptions, one risks trying to set model state with a reference
              to another model that doesn't exist yet!
            */
      return Promise.all(
        Object.keys(models).map(model_id => {
          // First put back the binary buffers
          const decode: { [s: string]: (s: string) => ArrayBuffer } = {
            base64: base64ToBuffer,
            hex: hexToBuffer
          };
          const model = models[model_id];
          const modelState = model.state;
          if (model.buffers) {
            const bufferPaths = model.buffers.map((b: any) => b.path);
            // put_buffers expects buffers to be DataViews
            const buffers = model.buffers.map(
              (b: any) => new DataView(decode[b.encoding](b.data))
            );
            put_buffers(model.state, bufferPaths, buffers);
          }

          // If the model has already been created, set its state and then
          // return it.
          if (this._models[model_id]) {
            return this._models[model_id].then(model => {
              // deserialize state
              return (model.constructor as typeof WidgetModel)
                ._deserialize_state(modelState || {}, this)
                .then(attributes => {
                  model.set_state(attributes); // case 2
                  return model;
                });
            });
          }

          const modelCreate: IModelOptions = {
            model_id: model_id,
            model_name: model.model_name,
            model_module: model.model_module,
            model_module_version: model.model_module_version
          };
          if (Object.prototype.hasOwnProperty.call(live_comms, 'model_id')) {
            // live comm
            // This connects to an existing comm if it exists, and
            // should *not* send a comm open message.
            return this._create_comm(this.comm_target_name, model_id).then(
              comm => {
                modelCreate.comm = comm;
                return this.new_model(modelCreate); // No state, so safe wrt. case 1
              }
            );
          } else {
            return this.new_model(modelCreate, modelState); // case 1
          }
        })
      );
    });

    return all_models;
  }

  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect(): void {
    Object.keys(this._models).forEach(i => {
      this._models[i].then(model => {
        model.comm_live = false;
      });
    });
  }

  /**
   * Resolve a URL relative to the current notebook location.
   *
   * The default implementation just returns the original url.
   */
  resolveUrl(url: string): Promise<string> {
    return Promise.resolve(url);
  }

  plaintext_sanitize(source: string): string {
    // Separate math from normal markdown text.
    let parts = removeMath(source);
    // Extract plain text
    let sanitized = default_plaintext_sanitize(parts['text']);
    // Replace math and return.
    return replaceMath(sanitized, parts['math']);
  }

  inline_sanitize(source: string): string {
    let parts = removeMath(source);
    // Sanitize tags for inline output.
    let sanitized = default_inline_sanitize(parts['text']);
    return replaceMath(sanitized, parts['math']);
  }

  /**
   * The comm target name to register
   */
  readonly comm_target_name = 'jupyter.widget';

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected abstract loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView>;

  /**
   * Create a comm which can be used for communication for a widget.
   *
   * If the data/metadata is passed in, open the comm before returning (i.e.,
   * send the comm_open message). If the data and metadata is undefined, we
   * want to reconstruct a comm that already exists in the kernel, so do not
   * open the comm by sending the comm_open message.
   *
   * @param comm_target_name Comm target name
   * @param model_id The comm id
   * @param data The initial data for the comm
   * @param metadata The metadata in the open message
   */
  protected abstract _create_comm(
    comm_target_name: string,
    model_id?: string,
    data?: JSONObject,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<IClassicComm>;
  protected abstract _get_comm_info(): Promise<{}>;

  /**
   * Filter serialized widget state to remove any ID's already present in manager.
   *
   * @param {*} state Serialized state to filter
   *
   * @returns {*} A copy of the state, with its 'state' attribute filtered
   */
  protected filterExistingModelState(serialized_state: any): any {
    let models = serialized_state.state;
    models = Object.keys(models)
      .filter(model_id => {
        return !this._models[model_id];
      })
      .reduce<IManagerStateMap>((res, model_id) => {
        res[model_id] = models[model_id];
        return res;
      }, {});
    return { ...serialized_state, state: models };
  }

  /**
   * Dictionary of model ids and model instance promises
   */
  private _models: { [key: string]: Promise<WidgetModel> } = Object.create(
    null
  );
}

export interface IStateOptions {
  /**
   * Drop model attributes that are equal to their default value.
   *
   * @default false
   */
  drop_defaults?: boolean;
}

/**
 * Serialize an array of widget models
 *
 * #### Notes
 * The return value follows the format given in the
 * @jupyter-widgets/schema package.
 */
export function serialize_state(
  models: WidgetModel[],
  options: IStateOptions = {}
): IManagerState {
  const state: IManagerStateMap = {};
  models.forEach(model => {
    const model_id = model.model_id;
    const split = remove_buffers(
      model.serialize(model.get_state(options.drop_defaults))
    );
    const buffers: IBase64Buffers[] = split.buffers.map((buffer, index) => {
      return {
        data: bufferToBase64(buffer),
        path: split.buffer_paths[index],
        encoding: 'base64'
      };
    });
    state[model_id] = {
      model_name: model.name,
      model_module: model.module,
      model_module_version: model.get('_model_module_version'),
      state: split.state
    };
    // To save space, only include the buffers key if we have buffers
    if (buffers.length > 0) {
      state[model_id].buffers = buffers;
    }
  });
  return { version_major: 2, version_minor: 0, state: state };
}
