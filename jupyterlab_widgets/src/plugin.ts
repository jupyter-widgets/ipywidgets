// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DocumentRegistry, IDocumentRegistry
} from 'jupyterlab/lib/docregistry';

import {
  INotebookModel
} from 'jupyterlab/lib/notebook/notebook/model';

import {
  NotebookPanel
} from 'jupyterlab/lib/notebook/notebook/panel';

import {
  JupyterLabPlugin, JupyterLab
} from 'jupyterlab/lib/application';

import {
  IDisposable, DisposableDelegate
} from 'phosphor/lib/core/disposable';

import {
  Token
} from 'phosphor/lib/core/token';

import {
  WidgetManager, WidgetRenderer, INBWidgetExtension
} from './index';

import 'jupyter-js-widgets/css/widgets-base.css';


const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget';


export
class NBWidgetExtension implements INBWidgetExtension {
  /**
   * Create a new extension object.
   */
  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let wManager = new WidgetManager(context, nb.content.rendermime);
    this._registry.forEach(data => wManager.register(data));
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

  /**
   * Register a widget module.
   */
  registerWidget(data: WidgetManager.IWidgetData) {
    this._registry.push(data);
  }
  private _registry: WidgetManager.IWidgetData[] = [];
}



/**
 * The widget manager provider.
 */
const widgetManagerProvider: JupyterLabPlugin<INBWidgetExtension> = {
  id: 'jupyter.extensions.widgetManager',
  provides: INBWidgetExtension,
  requires: [IDocumentRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetManagerProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterLab, registry: IDocumentRegistry) {
  let extension = new NBWidgetExtension();
  registry.addWidgetExtension('Notebook', extension);
  return extension;
}
