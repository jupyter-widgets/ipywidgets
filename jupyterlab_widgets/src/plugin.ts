// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DocumentRegistry, IDocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookModel
} from '@jupyterlab/notebook';

import {
  NotebookPanel
} from '@jupyterlab/notebook';

import {
  JupyterLabPlugin, JupyterLab
} from '@jupyterlab/application';

import {
  JSONObject, Token
} from '@phosphor/coreutils';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  WidgetRenderer
} from './renderer';

import {
  WidgetManager
} from './manager';

import {
  OutputModel, OutputView
} from './output';

import * as widgets from '@jupyter-widgets/controls';

(widgets as any)['OutputModel'] = OutputModel;
(widgets as any)['OutputView'] = OutputView;

import 'jupyter-widgets-base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';


const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

/**
 * The token identifying the JupyterLab plugin.
 */
export
const INBWidgetExtension = new Token<INBWidgetExtension>('jupyter.extensions.nbWidgetManager');

/**
 * The type of the provided value of the plugin in JupyterLab.
 */
export
type INBWidgetExtension = DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>;


export
class NBWidgetExtension implements INBWidgetExtension {
  /**
   * Create a new extension object.
   */
  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let wManager = new WidgetManager(context, nb.rendermime);
    wManager.register({
      name: '@jupyter-widgets/controls',
      version: widgets.JUPYTER_WIDGETS_VERSION,
      exports: widgets
    });

    this._registry.forEach(data => wManager.register(data));
    let wRenderer = new WidgetRenderer(wManager);

    nb.rendermime.addRenderer({mimeType: WIDGET_MIMETYPE, renderer: wRenderer}, 0);
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
  id: 'jupyter.extensions.nbWidgetManager',
  provides: INBWidgetExtension,
  requires: [IDocumentRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetManagerProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterLab, registry: IDocumentRegistry): INBWidgetExtension {
  let extension = new NBWidgetExtension();
  registry.addWidgetExtension('Notebook', extension);
  return extension;
}
