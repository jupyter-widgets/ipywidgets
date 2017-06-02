// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as Backbone from 'backbone';

import {
    ManagerBase, shims
} from '@jupyter-widgets/base';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Widget
} from '@phosphor/widgets';

import {
  IRenderMime
} from '@jupyterlab/rendermime';

import {
  Kernel
} from '@jupyterlab/services';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

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
  constructor(context: DocumentRegistry.IContext<DocumentRegistry.IModel>, rendermime: IRenderMime) {
    super();
    this._context = context;
    this._rendermime = rendermime;

    context.session.kernelChanged.connect((sender, kernel) => {
      this.newKernel(kernel);
    });

    if (context.session.kernel) {
      this.newKernel(context.session.kernel);
    }
  }

  newKernel(kernel: Kernel.IKernelConnection) {
    if (this._commRegistration) {
      this._commRegistration.dispose();
    }
    if (!kernel) {
      return;
    }
    this._commRegistration = kernel.registerCommTarget(this.comm_target_name,
    (comm, msg) => {
      let oldComm = new shims.services.Comm(comm);
      this.handle_comm_open(oldComm, msg);
    });
  };

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
   _create_comm(target_name: string, model_id: string, data?: any): Promise<any> {
    let comm = this._context.session.kernel.connectToComm(target_name, model_id);
    comm.open(data);
    return Promise.resolve(new shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this._context.session.kernel.requestCommInfo({target: 'jupyter.widget'}).then((reply) => {
      return reply.content.comms;
    });
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
   * Load a class and return a promise to the loaded object.
   */
  protected loadClass(className: string, moduleName: string, moduleVersion: string): any {
    let mod: any = this._registry.get(moduleName, moduleVersion);
    if (!mod) {
      return Promise.reject(`Module ${moduleName}, semver range ${moduleVersion} is not registered as a widget module`);
    }
    let cls: any = mod[className];
    if (!cls) {
      return Promise.reject(`Class ${className} not found in module ${moduleName}`);
    }
    return Promise.resolve(cls);
  }

  get context() {
    return this._context;
  }

  get rendermime() {
    return this._rendermime;
  }

  register(data: WidgetManager.IWidgetData) {
    this._registry.set(data.name, data.version, data.exports);
  }

  private _context: DocumentRegistry.IContext<DocumentRegistry.IModel>;
  private _registry = new SemVerCache<Promise<any>>();
  private _rendermime: IRenderMime;

  _commRegistration: IDisposable;
}

export
namespace WidgetManager {
  export
  interface IWidgetData {
    name: string,
    version: string,
    exports: any
  }
}

