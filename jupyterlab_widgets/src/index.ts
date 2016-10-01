// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as Backbone from 'backbone';

import {
  IKernel
} from 'jupyter-js-services';

import {
    ManagerBase, shims, DOMWidgetView
} from 'jupyter-js-widgets';

import * as widgets from 'jupyter-js-widgets';

import {
  IDisposable
} from 'phosphor/lib/core/disposable';

import {
  Panel
} from 'phosphor/lib/ui/panel';

import {
  Token
} from 'phosphor/lib/core/token';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  JSONObject
} from 'phosphor/lib/algorithm/json';

import {
  IRenderMime, RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  IDocumentContext, IDocumentModel
} from 'jupyterlab/lib/docregistry';

import {
  OutputModel, OutputView
} from './output';

import 'jquery-ui/themes/smoothness/jquery-ui.min.css';

import 'jupyter-js-widgets/css/widgets.min.css';

import {
  SemVerCache
} from './semvercache';

(widgets as any)['OutputModel'] = OutputModel;
(widgets as any)['OutputView'] = OutputView;

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
      console.log('View removed', view);
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
  constructor(context: IDocumentContext<IDocumentModel>, rendermime: IRenderMime) {
    super();
    this._context = context;
    this._rendermime = rendermime;
    this.register({
      name: 'jupyter-js-widgets',
      version: '2.0.0', // hardcoded because '*' doesn't match pre-release versions
      exports: widgets
    });

    context.kernelChanged.connect((sender, kernel) => {
      if (context.kernel) {
        this.validateVersion();
      }
      this.newKernel(kernel);
    });

    if (context.kernel) {
      this.validateVersion();
      this.newKernel(context.kernel);
    }
  }

  newKernel(kernel: IKernel) {
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
    let comm = this._context.kernel.connectToComm(target_name, model_id);
    comm.open(data);
    return Promise.resolve(new shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this._context.kernel.commInfo({target: 'jupyter.widget'}).then((reply) => {
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
  protected loadClass(className: string, moduleName: string, error: any): any {
    let mod: any = this._registry.get(moduleName, '*');
    if (!mod) {
      return Promise.reject(`Module ${moduleName} not registered as a widget module`);
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

  get displayWithOutput() {
    return true;
  }

  register(data: WidgetManager.IWidgetData) {
    this._registry.set(data.name, data.version, data.exports);
  }

  private _context: IDocumentContext<IDocumentModel>;
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


/**
 * A renderer for widgets.
 */
export
class WidgetRenderer implements RenderMime.IRenderer, IDisposable {
  constructor(widgetManager: WidgetManager) {
    this._manager = widgetManager;
  }

  /**
   * Whether the input can safely sanitized for a given mimetype.
   */
  isSanitizable(mimetype: string): boolean {
    return false;
  }

  /**
   * Whether the input is safe without sanitization.
   */
  isSafe(mimetype: string): boolean {
    return false;
  }

  /**
   * Render a widget mimetype.
   */
  render(options: RenderMime.IRendererOptions<string>): Widget {
    // data is a model id
    let w = new Panel();
    this._manager.get_model(options.source).then((model: any) => {
      return this._manager.display_model(void 0, model, void 0);
    }).then((view: Widget) => {
      w.addWidget(view);
    });
    return w;
  }

  /**
   * Get whether the manager is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._manager === null;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._manager = null;
  }

  public mimetypes = ['application/vnd.jupyter.widget'];
  private _manager: WidgetManager;
}
