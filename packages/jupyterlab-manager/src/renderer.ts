// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Panel, Widget
} from '@phosphor/widgets';

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
    WidgetManager
} from './manager';

import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  DragHandle
} from './draghandle';

import {
  FocusPanel
} from './focuspanel';

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
    const modelPromise = this._manager.get_model(source.model_id);

    // clear the existing children
    this.widgets.forEach(w => { w.dispose(); });

    this.addWidget(new DragHandle({
      newWidget: () => {
        let p = new FocusPanel();
        this.newWidget(p, modelPromise);
        p.title.label = 'Jupyter widget';
        return p;
      }
    }));
    this.newWidget(this, modelPromise);
  }

  newWidget(panel: Panel, modelPromise?: Promise<WidgetModel>): Widget {
    let placeholder = new Widget();
    panel.addWidget(placeholder);

    if (modelPromise) {
      placeholder.node.textContent = 'Rendering widget';
      this.renderJupyterWidget(modelPromise).then((w) => {
        panel.insertWidget(panel.widgets.indexOf(placeholder), w);
        placeholder.dispose();
      }, (err) => {
        console.error('Error rendering widget');
        console.error(err);
        placeholder.node.textContent = 'Error rendering widget';
      });
    } else {
      placeholder.node.textContent = 'Error creating widget: could not find widget model';
    }

    return panel;
  }

  async renderJupyterWidget(modelPromise?: Promise<WidgetModel>): Promise<Widget> {
    let wModel = await modelPromise;
    let widget = await this._manager.display_model(void 0, wModel, void 0);
    return widget;
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

  /**
   * The mimetype being rendered.
   */
  readonly mimeType: string;
  private _manager: WidgetManager;
}
