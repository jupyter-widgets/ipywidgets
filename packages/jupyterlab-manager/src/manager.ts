// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Just need typings
import * as Backbone from 'backbone';

import {
    ManagerBase, shims, IClassicComm, IWidgetRegistryData, ExportMap,
    ExportData, WidgetModel, WidgetView
} from '@jupyter-widgets/base';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Widget
} from '@phosphor/widgets';

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
  constructor(context: DocumentRegistry.IContext<DocumentRegistry.IModel>, rendermime: RenderMimeRegistry) {
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
    if ((moduleName === "@jupyter-widgets/base"
         || moduleName === "@jupyter-widgets/controls")
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

  private _handleCommOpen: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => Promise<void>;
  private _context: DocumentRegistry.IContext<DocumentRegistry.IModel>;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();
  private _rendermime: RenderMimeRegistry;

  _commRegistration: IDisposable;
}
