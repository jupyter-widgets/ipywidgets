// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

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
    constructor(options: IRenderMime.IRendererOptions, manager: WidgetManager) {
        super();
        this.mimeType = options.mimeType;
        this._manager = manager;
    }

  async renderModel(model: IRenderMime.IMimeModel) {
    const source: any = model.data[this.mimeType];

    // If there is no model id, the view was removed, so hide the node.
    if (source.model_id === '') {
      this.hide();
      return Promise.resolve();
    }

    const modelPromise = this._manager.get_model(source.model_id);
    if (modelPromise) {
      try {
        let wModel = await modelPromise;
        let widget = await this._manager.display_model(void 0, wModel, void 0);
        this.addWidget(widget);

        // If the widget is disposed, hide this container and make sure we
        // change the output model to reflect the view was closed.
        widget.disposed.connect(() => {
          this.hide();
          source.model_id = '';
        });
      } catch (err) {
        console.log('Error displaying widget');
        console.log(err);
        this.node.textContent = 'Error displaying widget';
      }
    } else {
      this.node.textContent = 'Error creating widget: could not find model';
      return Promise.resolve();
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

  /**
   * The mimetype being rendered.
   */
  readonly mimeType: string;
  private _manager: WidgetManager;
}
