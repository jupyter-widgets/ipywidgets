// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Just need typings
import * as Backbone from 'backbone';

import {
    ManagerBase, shims, IClassicComm, IWidgetRegistryData, ExportMap,
    ExportData, WidgetModel, WidgetView, put_buffers
} from '@jupyter-widgets/base';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Widget
} from '@phosphor/widgets';

import {
  INotebookModel
} from '@jupyterlab/notebook';

import {
  RenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
  Kernel, KernelMessage, Session
} from '@jupyterlab/services';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

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
  constructor(context: DocumentRegistry.IContext<INotebookModel>, rendermime: RenderMimeRegistry) {
    super();
    this._context = context;
    this._rendermime = rendermime;

    // Set _handleCommOpen so `this` is captured.
    this._handleCommOpen = async (comm, msg) => {
      let oldComm = new shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    };

    context.session.kernelChanged.connect((sender, args) => {
      this._handleKernelChanged(args);
    });

    context.session.statusChanged.connect((sender, args) => {
      this._handleKernelStatusChange(args);
    });

    this._setupInitialRestorePromise();

    if (context.session.kernel) {
      this._handleKernelChanged({oldValue: null, newValue: context.session.kernel});
    }
  }

  /**
   * Register a new kernel
   */
  _handleKernelChanged({oldValue, newValue}: Session.IKernelChangedArgs) {
    if (oldValue) {
      oldValue.removeCommTarget(this.comm_target_name, this._handleCommOpen);
    }

    if (newValue) {
      newValue.registerCommTarget(this.comm_target_name, this._handleCommOpen);
    }
  }

  _handleKernelStatusChange(args: Kernel.Status) {
    switch (args) {
    case 'connected':
      // Clear away any old widgets
      this._restored = this.restoreWidgets(this._context.model);
      break;
    case 'restarting':
      this.disconnect();
      break;
    default:
    }
  }

  /**
   * Restore widgets from kernel and saved state.
   */
  restoreWidgets(notebook: INotebookModel): Promise<void> {

    // Steps that needs to be done:
    // 1. Get any widget state from the kernel and open comms with existing state
    // 2. Check saved state for widgets, and restore any that would not overwrite
    //    any live widgets.
    // Attempt to reconstruct any live comms by requesting them from the back-end (1).
    return this._get_comm_info().then((comm_ids) => {

      // Create comm class instances from comm ids (2).
      const comm_promises = Object.keys(comm_ids).map((comm_id) => {
        return this._create_comm(this.comm_target_name, comm_id);
      });

      // Send a state request message out for each widget comm and wait
      // for the responses (1).
      return Promise.all(comm_promises).then((comms) => {
        return Promise.all(comms.map((comm) => {
          const update_promise = new Promise<Private.ICommUpdateData>((resolve, reject) => {
            comm.on_msg((msg) => {
              put_buffers(msg.content.data.state, msg.content.data.buffer_paths, msg.buffers);
              // A suspected response was received, check to see if
              // it's a state update. If so, resolve.
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
          }, this.callbacks());
          return update_promise;
        }));
      }).then((widgets_info) => {
        return Promise.all(widgets_info.map((widget_info) => {
          const content = widget_info.msg.content as any;
          return this.new_model({
            model_name: content.data.state._model_name,
            model_module: content.data.state._model_module,
            model_module_version: content.data.state._model_module_version,
            comm: widget_info.comm,
          }, content.data.state);
        }));
      }).then(() => {
        const widget_md = notebook.metadata.get('widgets') as any;
        // Now that we have mirrored any widgets from the kernel...
        // Restore any widgets from saved state that are not live (2)
        if (widget_md && widget_md[WIDGET_STATE_MIMETYPE]) {
          let state = widget_md[WIDGET_STATE_MIMETYPE];
          state = this.filterExistingModelState(state);
          return this.set_state(state);
        }
      }).then((models) => {
        if (this._resolveInitalRestore) {
          this._resolveInitalRestore();
          this._resolveInitalRestore = null;
        }
      });
    });
  }


  /**
   * Return a phosphor widget representing the view
   */
  display_view(msg: any, view: Backbone.View<Backbone.Model>, options: any): Promise<Widget> {
    let widget = (view as any).pWidget ? (view as any).pWidget : new BackboneViewWrapper(view);
    return Promise.resolve(widget);
  }

  /**
   * Create a comm.
   */
  async _create_comm(target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<IClassicComm> {
    // We await connectToComm because we still support using @jupyterlab/services<4
    let comm = await this._context.session.kernel.connectToComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata, buffers);
    }
    return Promise.resolve(new shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this._context.session.kernel.requestCommInfo({target: this.comm_target_name}).then(reply => reply.content.comms);
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
  resolveUrl(url: string): Promise<string> {
    return this.context.urlResolver.resolveUrl(url).then((partial) => {
      return this.context.urlResolver.getDownloadUrl(partial);
    });
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<typeof WidgetModel | typeof WidgetView> {

    // Special-case the Jupyter base and controls packages. If we have just a
    // plain version, with no indication of the compatible range, prepend a ^ to
    // get all compatible versions. We may eventually apply this logic to all
    // widget modules. See issues #2006 and #2017 for more discussion.
    if ((moduleName === '@jupyter-widgets/base'
         || moduleName === '@jupyter-widgets/controls')
        && valid(moduleVersion)) {
      moduleVersion = `^${moduleVersion}`;
    }

    let mod = this._registry.get(moduleName, moduleVersion);
    if (!mod) {
      return Promise.reject(`Module ${moduleName}, semver range ${moduleVersion} is not registered as a widget module`);
    }
    let modPromise: Promise<ExportMap>;
    if (typeof mod === 'function') {
      modPromise = Promise.resolve(mod());
    } else {
      modPromise = Promise.resolve(mod);
    }
    return modPromise.then((mod: any) => {
      let cls: any = mod[className];
      if (!cls) {
        return Promise.reject(`Class ${className} not found in module ${moduleName}`);
      }
      return cls;
    });
  }

  get context() {
    return this._context;
  }

  get rendermime() {
    return this._rendermime;
  }

  register(data: IWidgetRegistryData) {
    this._registry.set(data.name, data.version, data.exports);
  }

  async get_model(model_id: string): Promise<WidgetModel> {
    try {
      // First try to get it directly
      // Needed to do this first to avoid dead-lock:
      // - get_model
      // - restoreWidgets
      // - unpack
      return await super.get_model(model_id);
    } catch (err) {
      // If not directly available, try to wait for restoration
      return this._restored.then(() => {
        return super.get_model(model_id);
      });
    }
  }

  private _setupInitialRestorePromise() {
    this._restored = new Promise((resolve) => {
      this._resolveInitalRestore = resolve;
    });
  }

  private _handleCommOpen: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => Promise<void>;
  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();
  private _rendermime: RenderMimeRegistry;

  _commRegistration: IDisposable;
  private _restored: Promise<void>;
  private _resolveInitalRestore: (() => void) | null = null;
}


namespace Private {

  /**
   * Data promised when a comm info request resolves.
   */
  export
  interface ICommUpdateData {
    comm: IClassicComm;
    msg: KernelMessage.ICommMsg;
  }
}
