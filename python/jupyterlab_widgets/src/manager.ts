// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  shims,
  IClassicComm,
  IWidgetRegistryData,
  ExportMap,
  ExportData,
  WidgetModel,
  WidgetView,
  ICallbacks,
} from '@jupyter-widgets/base';

import {
  ManagerBase,
  serialize_state,
  IStateOptions,
} from '@jupyter-widgets/base-manager';

import { IDisposable } from '@lumino/disposable';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { INotebookModel } from '@jupyterlab/notebook';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { Kernel, KernelMessage, Session } from '@jupyterlab/services';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ISignal, Signal } from '@lumino/signaling';

import { valid } from 'semver';

import { SemVerCache } from './semvercache';

/**
 * The mime type for a widget view.
 */
export const WIDGET_VIEW_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

/**
 * The mime type for widget state data.
 */
export const WIDGET_STATE_MIMETYPE =
  'application/vnd.jupyter.widget-state+json';

/**
 * A widget manager that returns Lumino widgets.
 */
export abstract class LabWidgetManager
  extends ManagerBase
  implements IDisposable
{
  constructor(rendermime: IRenderMimeRegistry) {
    super();
    this._rendermime = rendermime;
  }

  /**
   * Default callback handler to emit unhandled kernel messages.
   */
  callbacks(view?: WidgetView): ICallbacks {
    return {
      iopub: {
        output: (msg: KernelMessage.IIOPubMessage): void => {
          this._onUnhandledIOPubMessage.emit(msg);
        },
      },
    };
  }

  /**
   * Register a new kernel
   */
  protected _handleKernelChanged({
    oldValue,
    newValue,
  }: Session.ISessionConnection.IKernelChangedArgs): void {
    if (oldValue) {
      oldValue.removeCommTarget(this.comm_target_name, this._handleCommOpen);
    }

    if (newValue) {
      newValue.registerCommTarget(this.comm_target_name, this._handleCommOpen);
    }
  }

  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect(): void {
    super.disconnect();
    this._restoredStatus = false;
  }

  protected async _loadFromKernel(): Promise<void> {
    if (!this.kernel) {
      throw new Error('Kernel not set');
    }
    if (this.kernel?.handleComms === false) {
      // A "load" for a kernel that does not handle comms does nothing.
      return;
    }

    return super._loadFromKernel();
  }

  /**
   * Create a comm.
   */
  async _create_comm(
    target_name: string,
    model_id: string,
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<IClassicComm> {
    const kernel = this.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const comm = kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata, buffers);
    }
    return new shims.services.Comm(comm);
  }

  /**
   * Get the currently-registered comms.
   */
  async _get_comm_info(): Promise<any> {
    const kernel = this.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const reply = await kernel.requestCommInfo({
      target_name: this.comm_target_name,
    });
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
    return this._isDisposed;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;

    if (this._commRegistration) {
      this._commRegistration.dispose();
    }
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    return url;
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected async loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView> {
    // Special-case the Jupyter base and controls packages. If we have just a
    // plain version, with no indication of the compatible range, prepend a ^ to
    // get all compatible versions. We may eventually apply this logic to all
    // widget modules. See issues #2006 and #2017 for more discussion.
    if (
      (moduleName === '@jupyter-widgets/base' ||
        moduleName === '@jupyter-widgets/controls') &&
      valid(moduleVersion)
    ) {
      moduleVersion = `^${moduleVersion}`;
    }

    const allVersions = this._registry.getAllVersions(moduleName);
    if (!allVersions) {
      throw new Error(`No version of module ${moduleName} is registered`);
    }
    const mod = this._registry.get(moduleName, moduleVersion);

    if (!mod) {
      const registeredVersionList = Object.keys(allVersions);
      throw new Error(
        `Module ${moduleName}, version ${moduleVersion} is not registered, however, \
        ${registeredVersionList.join(',')} ${
          registeredVersionList.length > 1 ? 'are' : 'is'
        }`
      );
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

  abstract get kernel(): Kernel.IKernelConnection | null;

  get rendermime(): IRenderMimeRegistry {
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

  register(data: IWidgetRegistryData): void {
    this._registry.set(data.name, data.version, data.exports);
  }

  /**
   * Register a widget model.
   */
  async register_model(
    model_id: string,
    modelPromise: Promise<WidgetModel>
  ): Promise<void> {
    super.register_model(model_id, modelPromise);

    // Update the synchronous model map
    const model = await modelPromise;
    this._modelsSync.set(model_id, model);
    model.once('comm:close', () => {
      this._modelsSync.delete(model_id);
    });
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  async clear_state(): Promise<void> {
    await super.clear_state();
    this._modelsSync = new Map();
  }

  /**
   * Synchronously get the state of the live widgets in the widget manager.
   *
   * This includes all of the live widget models, and follows the format given in
   * the @jupyter-widgets/schema package.
   *
   * @param options - The options for what state to return.
   * @returns A state dictionary
   */
  get_state_sync(options: IStateOptions = {}): ReadonlyPartialJSONValue {
    const models = [];
    for (const model of this._modelsSync.values()) {
      if (model.comm_live) {
        models.push(model);
      }
    }
    return serialize_state(models, options);
  }

  // _handleCommOpen is an attribute, not a method, so `this` is captured in a
  // single object that can be registered and removed
  protected _handleCommOpen = async (
    comm: Kernel.IComm,
    msg: KernelMessage.ICommOpenMsg
  ): Promise<void> => {
    const oldComm = new shims.services.Comm(comm);
    await this.handle_comm_open(oldComm, msg);
  };

  protected _restored = new Signal<this, void>(this);
  protected _restoredStatus = false;
  protected _kernelRestoreInProgress = false;

  private _isDisposed = false;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();
  private _rendermime: IRenderMimeRegistry;

  private _commRegistration: IDisposable;

  private _modelsSync = new Map<string, WidgetModel>();
  private _onUnhandledIOPubMessage = new Signal<
    this,
    KernelMessage.IIOPubMessage
  >(this);
}

/**
 * A widget manager that returns Lumino widgets.
 */
export class KernelWidgetManager extends LabWidgetManager {
  constructor(
    kernel: Kernel.IKernelConnection,
    rendermime: IRenderMimeRegistry
  ) {
    super(rendermime);
    this._kernel = kernel;

    kernel.statusChanged.connect((sender, args) => {
      this._handleKernelStatusChange(args);
    });
    kernel.connectionStatusChanged.connect((sender, args) => {
      this._handleKernelConnectionStatusChange(args);
    });

    this._handleKernelChanged({
      name: 'kernel',
      oldValue: null,
      newValue: kernel,
    });
    this.restoreWidgets();
  }

  _handleKernelConnectionStatusChange(status: Kernel.ConnectionStatus): void {
    if (status === 'connected') {
      // Only restore if we aren't currently trying to restore from the kernel
      // (for example, in our initial restore from the constructor).
      if (!this._kernelRestoreInProgress) {
        this.restoreWidgets();
      }
    }
  }

  _handleKernelStatusChange(status: Kernel.Status): void {
    if (status === 'restarting') {
      this.disconnect();
    }
  }

  /**
   * Restore widgets from kernel and saved state.
   */
  async restoreWidgets(): Promise<void> {
    try {
      this._kernelRestoreInProgress = true;
      await this._loadFromKernel();
      this._restoredStatus = true;
      this._restored.emit();
    } catch (err) {
      // Do nothing
    }
    this._kernelRestoreInProgress = false;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._kernel = null!;
    super.dispose();
  }

  get kernel(): Kernel.IKernelConnection {
    return this._kernel;
  }

  private _kernel: Kernel.IKernelConnection;
}

/**
 * A widget manager that returns phosphor widgets.
 */
export class WidgetManager extends LabWidgetManager {
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    rendermime: IRenderMimeRegistry,
    settings: WidgetManager.Settings
  ) {
    super(rendermime);
    this._context = context;

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
      this._handleKernelChanged({
        name: 'kernel',
        oldValue: null,
        newValue: context.sessionContext.session?.kernel,
      });
    }

    this.restoreWidgets(this._context!.model);

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
  private _saveState(): void {
    const state = this.get_state_sync({ drop_defaults: true });
    this._context.model.metadata.set('widgets', {
      'application/vnd.jupyter.widget-state+json': state,
    });
  }

  _handleKernelConnectionStatusChange(status: Kernel.ConnectionStatus): void {
    if (status === 'connected') {
      // Only restore if we aren't currently trying to restore from the kernel
      // (for example, in our initial restore from the constructor).
      if (!this._kernelRestoreInProgress) {
        // We only want to restore widgets from the kernel, not ones saved in the notebook.
        this.restoreWidgets(this._context!.model, {
          loadKernel: true,
          loadNotebook: false,
        });
      }
    }
  }

  _handleKernelStatusChange(status: Kernel.Status): void {
    if (status === 'restarting') {
      this.disconnect();
    }
  }

  /**
   * Restore widgets from kernel and saved state.
   */
  async restoreWidgets(
    notebook: INotebookModel,
    { loadKernel, loadNotebook } = { loadKernel: true, loadNotebook: true }
  ): Promise<void> {
    try {
      if (loadKernel) {
        try {
          this._kernelRestoreInProgress = true;
          await this._loadFromKernel();
        } finally {
          this._kernelRestoreInProgress = false;
        }
      }
      if (loadNotebook) {
        await this._loadFromNotebook(notebook);
      }

      // If the restore worked above, then update our state.
      this._restoredStatus = true;
      this._restored.emit();
    } catch (err) {
      // Do nothing if the restore did not work.
    }
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
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._context = null!;
    super.dispose();
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    const partial = await this.context.urlResolver.resolveUrl(url);
    return this.context.urlResolver.getDownloadUrl(partial);
  }

  get context(): DocumentRegistry.IContext<INotebookModel> {
    return this._context;
  }

  get kernel(): Kernel.IKernelConnection | null {
    return this._context.sessionContext?.session?.kernel ?? null;
  }

  /**
   * Register a widget model.
   */
  async register_model(
    model_id: string,
    modelPromise: Promise<WidgetModel>
  ): Promise<void> {
    super.register_model(model_id, modelPromise);
    this.setDirty();
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  async clear_state(): Promise<void> {
    await super.clear_state();
    this.setDirty();
  }

  /**
   * Set the dirty state of the notebook model if applicable.
   *
   * TODO: perhaps should also set dirty when any model changes any data
   */
  setDirty(): void {
    if (this._settings.saveState) {
      this._context!.model.dirty = true;
    }
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _settings: WidgetManager.Settings;
}

export namespace WidgetManager {
  export type Settings = {
    saveState: boolean;
  };
}
