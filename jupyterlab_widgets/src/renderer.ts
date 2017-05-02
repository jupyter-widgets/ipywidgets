// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Panel, Widget
} from '@phosphor/widgets';

import {
  RenderMime
} from '@jupyterlab/rendermime';

import {
    WidgetManager
} from './manager';

/**
 * A renderer for widgets.
 */
export
class WidgetRenderer implements RenderMime.IRenderer, IDisposable {
  constructor(widgetManager: WidgetManager) {
    this._manager = widgetManager;
  }

  /**
   * Whether the renderer can render given the render options.
   *
   * @param options - The options that would be used to render the data.
   */
  canRender(options: RenderMime.IRenderOptions): boolean {
    let source: any = options.model.data.get(options.mimeType);
    let model = this._manager.get_model(source.model_id);
    return model !== void 0;
  }

  /**
   * Whether the renderer will sanitize the data given the render options.
   */
  wouldSanitize(options: RenderMime.IRenderOptions): boolean {
    return false;
  }

  /**
   * Render the transformed mime data.
   *
   * @param options - The options used to render the data.
   */
  render(options: RenderMime.IRenderOptions): Widget {
    // data is a model id
    let w = new Panel();
    let source: any = options.model.data.get(options.mimeType);
    let model = this._manager.get_model(source.model_id);
    if (model) {
      model.then((model: any) => {
        return this._manager.display_model(void 0, model, void 0);
      }).then((view: Widget) => {
        w.addWidget(view);
      });
    } else {
      // Model doesn't exist
      let error = document.createElement('p');
      error.textContent = 'Widget not found.';
      w.addWidget(new Widget({node: error}));
    }
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

  public mimeTypes = ['application/vnd.jupyter.widget-view+json'];
  private _manager: WidgetManager;
}
