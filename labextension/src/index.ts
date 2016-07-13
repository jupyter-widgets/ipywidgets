// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as Backbone from 'backbone';

import {
  IKernel
} from 'jupyter-js-services';

import {
    ManagerBase, shims, DOMWidgetView
} from 'jupyter-js-widgets';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  Panel
} from 'phosphor-panel';

import {
  Widget
} from 'phosphor-widget';

import {
  IRenderer, RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  IDocumentContext, IDocumentModel
} from 'jupyterlab/lib/docregistry';

import {
  OutputModel, OutputView
} from './output';

import 'jquery-ui/themes/smoothness/jquery-ui.min.css';

import 'jupyter-js-widgets/css/widgets.min.css';

// TODO: when upgrading to phosphor monorepo, return the monorepo widget from display_view
// TODO: and add it to the WidgetRenderer.render's panel directly.

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
  constructor(context: IDocumentContext<IDocumentModel>, rendermime: RenderMime<Widget>) {
    super();
    this._context = context;
    this._rendermime = rendermime;

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
    return Promise.resolve(new BackboneViewWrapper(view))
    //TODO: when we switch to the phosphor monorepo, so we can return those widgets
    //return (view as any).pWidget ? (view as any).pWidget : new BackboneViewWrapper(view);
  }

  /**
   * Create a comm.
   */
   _create_comm(target_name: string, model_id: string, data?: any): Promise<any> {
    let comm = this._context.kernel.connectToComm(target_name, model_id);
    comm.open(); // should we open it???
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
    if (moduleName === 'jupyter-js-widgets'
        && (className === 'OutputModel'
            || className === 'OutputView')) {
      if (className === 'OutputModel') {
        return Promise.resolve(OutputModel);
      } else if (className === 'OutputView') {
        return Promise.resolve(OutputView);
      }
    }
    return super.loadClass(className, moduleName, error);
  }


  get context() {
    return this._context;
  }

  get rendermime() {
    return this._rendermime;
  }

  private _context: IDocumentContext<IDocumentModel>;
  private _rendermime: RenderMime<Widget>;
  _commRegistration: IDisposable;
}


/**
 * A renderer for widgets.
 */
export
class WidgetRenderer implements IRenderer<Widget>, IDisposable {
  constructor(widgetManager: WidgetManager) {
    this._manager = widgetManager;
  }

  /**
   * Render a widget mimetype.
   */
  render(mimetype: string, data: string): Widget {
    // data is a model id
    let w = new Panel();
    this._manager.get_model(data).then((model: any) => {
      return this._manager.display_model(void 0, model, void 0);
    }).then((view: Widget) => {
      w.addChild(view);
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
