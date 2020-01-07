// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Just need typings
import * as Backbone from 'backbone';

import {
    ManagerBase, shims, IClassicComm, IWidgetRegistryData, ExportMap,
    ExportData, WidgetModel, WidgetView, put_buffers, serialize_state, IStateOptions
} from '@jupyter-widgets/base';

import {
  IDisposable
} from '@lumino/disposable';

import {
  PromiseDelegate
} from '@lumino/coreutils';

import {
  Widget
} from '@lumino/widgets';

import {
  INotebookModel
} from '@jupyterlab/notebook';

import {
  IRenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
  Kernel, KernelMessage, Session
} from '@jupyterlab/services';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  ISignal, Signal
} from '@lumino/signaling';

import {
  valid
} from 'semver';

import {
  SemVerCache
} from './semvercache';


/**
 * The mime type for a widget view.
 */
export
const WIDGET_VIEW_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

/**
 * The mime type for widget state data.
 */
export
const WIDGET_STATE_MIMETYPE = 'application/vnd.jupyter.widget-state+json';

/**
 * The class name added to an BackboneViewWrapper widget.
 */
const BACKBONEVIEWWRAPPER_CLASS = 'jp-BackboneViewWrapper';

export
class BackboneViewWrapper extends Widget {
  /**
   * Construct a new `Backbone` wrapper widget.
   *
   * @param view - The `Backbone.View` instance being wrapped.
   */
  constructor(view: Backbone.View<any>) {
    super();
    this._view = view;
    view.on('remove', () => {
      this.dispose();
    });
    this.addClass(BACKBONEVIEWWRAPPER_CLASS);
    this.node.appendChild(view.el);
  }

  onAfterAttach(msg: any) {
    this._view.trigger('displayed');
  }

  dispose() {
    this._view = null;
    super.dispose();
  }

  private _view: Backbone.View<any> = null;
}


/**
 * A widget manager that returns phosphor widgets.
 */
export
class WidgetManager extends ManagerBase<Widget> implements IDisposable {
  constructor(context: DocumentRegistry.IContext<INotebookModel>, rendermime: IRenderMimeRegistry, settings: WidgetManager.Settings) {
    super();
    this._context = context;
    this._rendermime = rendermime;

    // Set _handleCommOpen so `this` is captured.
    this._handleCommOpen = async (comm, msg) => {
      let oldComm = new shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    };

    context.sessionContext.kernelChanged.connect((sender, args) => {
      this._handleKernelChanged(args);
    });

    context.sessionContext.statusChanged.connect((sender, args) => {
      this._handleKernelStatusChange(args);
    });
    context.sessionContext.connectionStatusChanged.connect((sender, args) => {
      this._handleKernelConnectionStatusChange(args);
    });


    if (context.sessionContext.session?.kernel) {
      this._handleKernelChanged({name: 'kernel', oldValue: null, newValue: context.sessionContext.session?.kernel});
    }
    this.restoreWidgets(this._context.model);

    this._settings = settings;
    context.saveState.connect((sender, saveState) => {
      if (saveState === 'started' && settings.saveState) {
        this._saveState();
      }
    });
  }

  /**
   * Save the widget state to the context model.
   */
  private _saveState() {
    const state = this.get_state_sync({ drop_defaults: true });
    this._context.model.metadata.set('widgets', {
      'application/vnd.jupyter.widget-state+json' : state
    });
  }

  /**
   * Default callback handler to emit unhandled kernel messages.
   */
  callbacks(view?: WidgetView) {
    return {
        iopub: {
            output: (msg: KernelMessage.IIOPubMessage) => {
              this._onUnhandledIOPubMessage.emit(msg);
            }
        }
    };
  }

  /**
   * Register a new kernel
   */
  _handleKernelChanged({oldValue, newValue}: Session.ISessionConnection.IKernelChangedArgs) {
    if (oldValue) {
      oldValue.removeCommTarget(this.comm_target_name, this._handleCommOpen);
    }

    if (newValue) {
      newValue.registerCommTarget(this.comm_target_name, this._handleCommOpen);
    }
  }

  _handleKernelConnectionStatusChange(status: Kernel.ConnectionStatus) {
    if (status === 'connected') {
        // Only restore if our initial restore at construction is finished
        if (this._initialRestoredStatus) {
          // We only want to restore widgets from the kernel, not ones saved in the notebook.
          this.restoreWidgets(this._context.model, {loadKernel: true, loadNotebook: false});
        }

    }
  }

  _handleKernelStatusChange(status: Kernel.Status) {
    if (status === 'restarting') {
      this.disconnect();
    }
  }

  /**
   * Restore widgets from kernel and saved state.
   */
  async restoreWidgets(notebook: INotebookModel, {loadKernel, loadNotebook} = {loadKernel: true, loadNotebook: true}): Promise<void> {
    if (loadKernel) {
      await this._loadFromKernel();
    }
    if (loadNotebook) {
      await this._loadFromNotebook(notebook);
    }
    this._restoredStatus = true;
    this._initialRestoredStatus = true;
    this._restored.emit();
  }

  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect() {
    super.disconnect();
    this._restoredStatus = false;
  }

  async _loadFromKernel(): Promise<void> {
    if (!this.context.sessionContext) {
      return;
    }
    await this.context.sessionContext.ready;
    // TODO: when we upgrade to @jupyterlab/services 4.1 or later, we can
    // remove this 'any' cast.
    if (this.context.sessionContext.session?.kernel.handleComms === false) {
      return;
    }
    const comm_ids = await this._get_comm_info();

    // For each comm id that we do not know about, create the comm, and request the state.
    const widgets_info = await Promise.all(Object.keys(comm_ids).map(async (comm_id) => {
      try {
        await this.get_model(comm_id);
        // If we successfully get the model, do no more.
        return;
      } catch (e) {
        // If we have the widget model not found error, then we can create the
        // widget. Otherwise, rethrow the error. We have to check the error
        // message text explicitly because the get_model function in this
        // class throws a generic error with this specific text.
        if (e.message !== 'widget model not found') {
          throw e;
        }
        const comm = await this._create_comm(this.comm_target_name, comm_id);

        let msg_id: string;
        const info = new PromiseDelegate<Private.ICommUpdateData>();
        comm.on_msg((msg: KernelMessage.ICommMsgMsg) => {
          if ((msg.parent_header as any).msg_id === msg_id
            && msg.header.msg_type === 'comm_msg'
            && msg.content.data.method === 'update') {
            let data = (msg.content.data as any);
            let buffer_paths = data.buffer_paths || [];
            // Make sure the buffers are DataViews
            let buffers = (msg.buffers || []).map(b => {
                if (b instanceof DataView) {
                    return b;
                } else {
                    return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
                }
            });
            put_buffers(data.state, buffer_paths, buffers);
            info.resolve({comm, msg});
          }
        });
        msg_id = comm.send({
          method: 'request_state'
        }, this.callbacks(undefined));

        return info.promise;
      }
    }));

    // We put in a synchronization barrier here so that we don't have to
    // topologically sort the restored widgets. `new_model` synchronously
    // registers the widget ids before reconstructing their state
    // asynchronously, so promises to every widget reference should be available
    // by the time they are used.
    await Promise.all(widgets_info.map(async widget_info => {
      if (!widget_info) {
        return;
      }
      const content = widget_info.msg.content as any;
      await this.new_model({
        model_name: content.data.state._model_name,
        model_module: content.data.state._model_module,
        model_module_version: content.data.state._model_module_version,
        comm: widget_info.comm,
      }, content.data.state);
    }));
  }


  /**
   * Load widget state from notebook metadata
   */
  async _loadFromNotebook(notebook: INotebookModel): Promise<void> {
    const widget_md = notebook.metadata.get('widgets') as any;
    // Restore any widgets from saved state that are not live
    if (widget_md && widget_md[WIDGET_STATE_MIMETYPE]) {
      let state = widget_md[WIDGET_STATE_MIMETYPE];
      state = this.filterExistingModelState(state);
      await this.set_state(state);
    }
  }

  /**
   * Return a phosphor widget representing the view
   */
  async display_view(msg: any, view: Backbone.View<Backbone.Model>, options: any): Promise<Widget> {
    return (view as any).pWidget || new BackboneViewWrapper(view);
  }

  /**
   * Create a comm.
   */
  async _create_comm(target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<IClassicComm> {
    let kernel = this._context.sessionContext.session?.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    let comm = kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata, buffers);
    }
    return new shims.services.Comm(comm);
  }

  /**
   * Get the currently-registered comms.
   */
  async _get_comm_info(): Promise<any> {
    let kernel = this._context.sessionContext.session?.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const reply = await kernel.requestCommInfo({target_name: this.comm_target_name});
    if (reply.content.status === 'ok') {
        return (reply.content as any).comms;
    } else {
        return {};
    }
  }

  /**
   * Get whether the manager is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._context === null;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    if (this._commRegistration) {
      this._commRegistration.dispose();
    }
    this._context = null;
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    const partial = await this.context.urlResolver.resolveUrl(url);
    return this.context.urlResolver.getDownloadUrl(partial);
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected async loadClass(className: string, moduleName: string, moduleVersion: string): Promise<typeof WidgetModel | typeof WidgetView> {

    // Special-case the Jupyter base and controls packages. If we have just a
    // plain version, with no indication of the compatible range, prepend a ^ to
    // get all compatible versions. We may eventually apply this logic to all
    // widget modules. See issues #2006 and #2017 for more discussion.
    if ((moduleName === '@jupyter-widgets/base'
         || moduleName === '@jupyter-widgets/controls')
        && valid(moduleVersion)) {
      moduleVersion = `^${moduleVersion}`;
    }

    const mod = this._registry.get(moduleName, moduleVersion);
    if (!mod) {
      throw new Error(`Module ${moduleName}, semver range ${moduleVersion} is not registered as a widget module`);
    }
    let module: ExportMap;
    if (typeof mod === 'function') {
      module = await mod();
    } else {
      module = await mod;
    }
    const cls: any = module[className];
    if (!cls) {
      throw new Error(`Class ${className} not found in module ${moduleName}`);
    }
    return cls;
  }

  get context() {
    return this._context;
  }

  get rendermime() {
    return this._rendermime;
  }

  /**
   * A signal emitted when state is restored to the widget manager.
   *
   * #### Notes
   * This indicates that previously-unavailable widget models might be available now.
   */
  get restored(): ISignal<this, void> {
    return this._restored;
  }

  /**
   * Whether the state has been restored yet or not.
   */
  get restoredStatus(): boolean {
    return this._restoredStatus;
  }

  /**
   * A signal emitted for unhandled iopub kernel messages.
   *
   */
  get onUnhandledIOPubMessage(): ISignal<this, KernelMessage.IIOPubMessage> {
    return this._onUnhandledIOPubMessage;
  }

  register(data: IWidgetRegistryData) {
    this._registry.set(data.name, data.version, data.exports);
  }

  /**
   * Get a model
   *
   * #### Notes
   * Unlike super.get_model(), this implementation always returns a promise and
   * never returns undefined. The promise will reject if the model is not found.
   */
  async get_model(model_id: string): Promise<WidgetModel> {
    const modelPromise = super.get_model(model_id);
    if (modelPromise === undefined) {
      throw new Error('widget model not found');
    }
    return modelPromise;
  }

  /**
   * Register a widget model.
   */
  register_model(model_id: string, modelPromise: Promise<WidgetModel>): void {
    super.register_model(model_id, modelPromise);

    // Update the synchronous model map
    modelPromise.then(model => {
        this._modelsSync.set(model_id, model);
        model.once('comm:close', () => {
            this._modelsSync.delete(model_id);
        });
    });
    this.setDirty();
  }


  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  async clear_state(): Promise<void> {
    await super.clear_state();
    this._modelsSync = new Map();
    this.setDirty();
  }

  /**
   * Synchronously get the state of the live widgets in the widget manager.
   *
   * This includes all of the live widget models, and follows the format given in
   * the @jupyter-widgets/schema package.
   *
   * @param options - The options for what state to return.
   * @returns Promise for a state dictionary
   */
  get_state_sync(options: IStateOptions = {}) {
      const models = [];
      for (let model of this._modelsSync.values()) {
        if (model.comm_live) {
          models.push(model);
        }
      }
      return serialize_state(models, options);
  }

  /**
   * Set the dirty state of the notebook model if applicable.
   *
   * TODO: perhaps should also set dirty when any model changes any data
   */
  setDirty() {
    if (this._settings.saveState) {
      this._context.model.dirty = true;
    }
  }

  private _handleCommOpen: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => Promise<void>;
  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();
  private _rendermime: IRenderMimeRegistry;

  _commRegistration: IDisposable;
  private _restored = new Signal<this, void>(this);
  private _restoredStatus = false;
  private _initialRestoredStatus = false;

  private _modelsSync = new Map<string, WidgetModel>();
  private _settings: WidgetManager.Settings;
  private _onUnhandledIOPubMessage = new Signal<this, KernelMessage.IIOPubMessage>(this);
}


export
namespace WidgetManager {
  export
  type Settings = {
    saveState: boolean
  };
}


namespace Private {

  /**
   * Data promised when a comm info request resolves.
   */
  export
  interface ICommUpdateData {
    comm: IClassicComm;
    msg: KernelMessage.ICommMsgMsg;
  }
}
