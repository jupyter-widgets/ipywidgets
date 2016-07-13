// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IWidgetExtension, IDocumentContext, IDocumentModel, DocumentRegistry
} from 'jupyterlab/lib/docregistry';

import {
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  INotebookModel
} from 'jupyterlab/lib/notebook/notebook/model';

import {
  NotebookPanel
} from 'jupyterlab/lib/notebook/notebook/panel';

import {
  Application
} from 'phosphide/lib/core/application';

import {
  WidgetManager, WidgetRenderer
} from './index';

import {
  IKernel
} from 'jupyter-js-services';

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget';

/**
 * The widget manager provider.
 */
export
const widgetManagerExtension = {
  id: 'jupyter.extensions.widgetManager',
  requires: [DocumentRegistry],
  activate: activateWidgetExtension
};

export
class IPyWidgetExtension implements IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(nb: NotebookPanel, context: IDocumentContext<INotebookModel>): IDisposable {
    let wManager = new WidgetManager(context, nb.content.rendermime);
    let wRenderer = new WidgetRenderer(wManager);

    nb.content.rendermime.addRenderer(WIDGET_MIMETYPE, wRenderer, 0);
    return new DisposableDelegate(() => {
      if (nb.rendermime) {
        nb.rendermime.removeRenderer(WIDGET_MIMETYPE);
      }
      wRenderer.dispose();
      wManager.dispose();
    });
  }
}

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: Application, registry: DocumentRegistry) {
  registry.addWidgetExtension('Notebook', new IPyWidgetExtension());
}
