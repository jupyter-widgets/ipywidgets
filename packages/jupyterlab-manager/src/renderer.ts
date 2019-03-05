// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  PromiseDelegate
} from '@phosphor/coreutils';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Panel
} from '@phosphor/widgets';

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
    WidgetManager
} from './manager';

/**
 * A renderer for widgets.
 */
export
class WidgetRenderer extends Panel implements IRenderMime.IRenderer, IDisposable {
    constructor(options: IRenderMime.IRendererOptions, manager?: WidgetManager) {
        super();
        this.mimeType = options.mimeType;
        if (manager) {
          this.manager = manager;
        }
    }

  /**
   * The widget manager.
   */
  set manager(value: WidgetManager) {
    value.restored.connect(this._rerender, this);
    this._manager.resolve(value);
  }

  async renderModel(model: IRenderMime.IMimeModel) {
    const source: any = model.data[this.mimeType];
    const manager = await this._manager.promise;
    // If there is no model id, the view was removed, so hide the node.
    if (source.model_id === '') {
      this.hide();
      return Promise.resolve();
    }

    // If we can get a promise to the model now, display it.
    try {
      const wModel = await manager.get_model(source.model_id);
      const widget = await manager.display_model(undefined, wModel, undefined);
      this.addWidget(widget);
      // If the widget is disposed, hide this container and make sure we
      // change the output model to reflect the view was closed.
      widget.disposed.connect(() => {
        this.hide();
        source.model_id = '';
      });

      // Successful, so we don't need to try to rerender.
      this._rerenderModel = null;
    } catch (err) {
      console.log('Error displaying widget');
      console.log(err);
      this.node.textContent = 'Error displaying widget';
      this.addClass('jupyter-widgets');

      // Store the model for a possible rerender
      this._rerenderModel = model;
    }
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
    super.dispose();
    this._manager = null;
  }

  private _rerender() {
    if (this._rerenderModel) {
      // Clear the error message
      this.node.textContent = '';
      this.removeClass('jupyter-widgets');

      // Attempt to rerender.
      this.renderModel(this._rerenderModel);
    }
  }

  /**
   * The mimetype being rendered.
   */
  readonly mimeType: string;
  private _manager = new PromiseDelegate<WidgetManager>();
  private _rerenderModel: IRenderMime.IMimeModel | null = null;
}
