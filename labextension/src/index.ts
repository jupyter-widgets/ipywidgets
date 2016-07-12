// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as Backbone from 'backbone';

import {
  IKernel, KernelMessage
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

import 'jquery-ui/themes/smoothness/jquery-ui.min.css';

import 'jupyter-js-widgets/css/widgets.min.css';

// TODO: when upgrading to phosphor monorepo, return the monorepo widget from display_view
// TODO: and add it to the WidgetRenderer.render's panel directly.

/**
 * A widget manager that returns phosphor widgets.
 */
export
class WidgetManager extends ManagerBase<HTMLElement> implements IDisposable {
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
  display_view(msg: any, view: DOMWidgetView, options: any): Promise<HTMLElement> {
    // TODO: if view.pWidget exists, use it instead of BackboneViewWrapper.
    return Promise.resolve(view.el);
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
    }).then((view: HTMLElement) => {
      let child = new Widget();
      child.node.appendChild(view);
      w.addChild(child);
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

/**
 * An output widget
 * 
 * The output widget maintains a list of output messages and renders them.
 * When an output widget is sent a capture message, it takes over processing
 * of outputs for that particular message id. So we need a hook at the kernel level
 * for processing messages, and the capability to install filters on kernel messages
 * with a particular parent id.
 */
