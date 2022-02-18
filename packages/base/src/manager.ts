// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JSONObject } from '@lumino/coreutils';

import { IClassicComm, ICallbacks } from './services-shim';

import {
  DOMWidgetModel,
  DOMWidgetView,
  WidgetModel,
  WidgetView,
} from './widget';

/**
 * The options for a model.
 *
 * #### Notes
 * Either a comm or a model_id must be provided.
 */
export interface IModelOptions {
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
  view_name?: string | null;

  /**
   * Module name of the widget view to create.
   */
  view_module?: string | null;

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

/**
 * The options for a connected model.
 *
 * This gives all of the information needed to instantiate a comm to a new
 * widget on the kernel side (so view information is mandatory).
 *
 * #### Notes
 * Either a comm or a model_id must be provided.
 */
export interface IWidgetOptions extends IModelOptions {
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
  view_name: string | null;

  /**
   * Module name of the widget view to create.
   */
  view_module: string | null;

  /**
   * Semver version requirement for the view module.
   */
  view_module_version: string;

  /**
   * Comm object associated with the widget.
   */
  comm?: IClassicComm;

  /**
   * The model id to use. If not provided, the comm id of the comm is used.
   */
  model_id?: string;
}

/**
 * The widget manager interface exposed on the Widget instances
 */
export interface IWidgetManager {
  /**
   * Get a promise for a model by model id.
   *
   * #### Notes
   * If a model is not found, undefined is returned (NOT a promise). However,
   * the calling code should also deal with the case where a rejected promise
   * is returned, and should treat that also as a model not found.
   */
  get_model(model_id: string): Promise<WidgetModel>;

  /**
   * Returns true if the given model is registered, otherwise false.
   *
   * #### Notes
   * This is a synchronous way to check if a model is registered.
   */
  has_model(model_id: string): boolean;

  /**
   * Register a model instance promise with the manager.
   *
   * By registering the model, it can later be retrieved with `get_model`.
   */
  register_model(model_id: string, modelPromise: Promise<WidgetModel>): void;

  /**
   * Create a comm and new widget model.
   * @param  options - same options as new_model but comm is not
   *                          required and additional options are available.
   * @param  serialized_state - serialized model attributes.
   */
  new_widget(
    options: IWidgetOptions,
    serialized_state?: JSONObject
  ): Promise<WidgetModel>;

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
  new_model(
    options: IModelOptions,
    serialized_state?: JSONObject
  ): Promise<WidgetModel>;

  /**
   * Creates a promise for a view of a given model
   *
   * Make sure the view creation is not out of order with
   * any state updates.
   */
  create_view<VT extends DOMWidgetView = DOMWidgetView>(
    model: DOMWidgetModel,
    options?: unknown
  ): Promise<VT>;
  create_view<VT extends WidgetView = WidgetView>(
    model: WidgetModel,
    options?: unknown
  ): Promise<VT>;

  /**
   * callback handlers specific to a view
   */
  callbacks(view?: WidgetView): ICallbacks;

  /**
   * Resolve a URL relative to the current notebook location.
   *
   * The default implementation just returns the original url.
   */
  resolveUrl(url: string): Promise<string>;

  inline_sanitize(s: string): string;
}
