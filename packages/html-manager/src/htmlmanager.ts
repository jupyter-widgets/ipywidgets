// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as controls from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import * as outputWidgets from './output';

import { createErrorWidgetModel, ErrorWidgetView } from '@jupyter-widgets/base';
import { ManagerBase } from '@jupyter-widgets/base-manager';
import { MessageLoop } from '@lumino/messaging';

import * as LuminoWidget from '@lumino/widgets';
import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';

import { WidgetRenderer, WIDGET_MIMETYPE } from './output_renderers';

import type {
  WidgetModel,
  WidgetView,
  DOMWidgetView,
} from '@jupyter-widgets/base';

export class HTMLManager extends ManagerBase {
  constructor(options?: {
    loader?: (moduleName: string, moduleVersion: string) => Promise<any>;
  }) {
    super();
    this.loader = options?.loader;
    this.renderMime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
    });
    this.renderMime.addFactory(
      {
        safe: false,
        mimeTypes: [WIDGET_MIMETYPE],
        createRenderer: (options) => new WidgetRenderer(options, this),
      },
      0
    );

    this._viewList = new Set<DOMWidgetView>();
    window.addEventListener('resize', () => {
      this._viewList.forEach((view) => {
        MessageLoop.postMessage(
          view.luminoWidget,
          LuminoWidget.Widget.ResizeMessage.UnknownSize
        );
      });
    });
  }
  /**
   * Display the specified view. Element where the view is displayed
   * is specified in the `options.el` argument.
   */
  async display_view(
    view: Promise<DOMWidgetView> | DOMWidgetView,
    el: HTMLElement
  ): Promise<void> {
    let v: DOMWidgetView;
    try {
      v = await view;
    } catch (error) {
      const msg = `Could not create a view for ${view}`;
      console.error(msg);
      const ModelCls = createErrorWidgetModel(error, msg);
      const errorModel = new ModelCls();
      v = new ErrorWidgetView({
        model: errorModel,
      });
      v.render();
    }

    LuminoWidget.Widget.attach(v.luminoWidget, el);
    this._viewList.add(v);
    v.once('remove', () => {
      this._viewList.delete(v);
    });
  }

  /**
   * Placeholder implementation for _get_comm_info.
   */
  _get_comm_info(): Promise<{}> {
    return Promise.resolve({});
  }

  /**
   * Placeholder implementation for _create_comm.
   */
  _create_comm(
    comm_target_name: string,
    model_id: string,
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<any> {
    return Promise.resolve({
      on_close: () => {
        return;
      },
      on_msg: () => {
        return;
      },
      close: () => {
        return;
      },
    });
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected async loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView> {
    let module: any;
    if (
      moduleName === '@jupyter-widgets/base' &&
      moduleVersion /* Some semver test??? */ === base.JUPYTER_WIDGETS_VERSION
    ) {
      module = base;
    } else if (
      moduleName === '@jupyter-widgets/controls' &&
      moduleVersion /* Some semver test??? */ ===
        controls.JUPYTER_CONTROLS_VERSION
    ) {
      module = controls;
    } else if (
      moduleName === '@jupyter-widgets/output' &&
      moduleVersion /* Some semver test??? */ ===
        outputWidgets.OUTPUT_WIDGET_VERSION
    ) {
      module = outputWidgets;
    } else if (this.loader !== undefined) {
      module = await this.loader(moduleName, moduleVersion);
    } else {
      throw new Error(`Could not load module ${moduleName}@${moduleVersion}`);
    }

    if ((module as any)[className]) {
      return (module as any)[className];
    } else {
      throw Error(
        `Class ${className} not found in module ${moduleName}@${moduleVersion}`
      );
    }
  }

  /**
   * Renderers for contents of the output widgets
   *
   * Defines how outputs in the output widget should be rendered.
   */
  renderMime: RenderMimeRegistry;

  /**
   * A loader for a given module name and module version, and returns a promise to a module
   */
  loader:
    | ((moduleName: string, moduleVersion: string) => Promise<any>)
    | undefined;

  private _viewList: Set<DOMWidgetView>;
}
