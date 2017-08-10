// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DocumentRegistry
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
  OutputModel, OutputView, OUTPUT_WIDGET_VERSION
} from './output';

import * as base from '@jupyter-widgets/base';
import * as widgets from '@jupyter-widgets/controls';

import '@jupyter-widgets/base/css/index.css';
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
interface INBWidgetExtension extends DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Register a widget module.
   */
  registerWidget(data: WidgetManager.IWidgetData): void;
}


export
class NBWidgetExtension implements INBWidgetExtension {
  /**
   * Create a new extension object.
   */
  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let wManager = new WidgetManager(context, nb.rendermime);
    wManager.register({
      name: '@jupyter-widgets/base',
      version: base.JUPYTER_WIDGETS_VERSION,
      exports: {
        WidgetModel: base.WidgetModel,
        WidgetView: base.WidgetView,
        DOMWidgetView: base.DOMWidgetView,
        DOMWidgetModel: base.DOMWidgetModel,
        LayoutModel: base.LayoutModel,
        LayoutView: base.LayoutView,
        StyleModel: base.StyleModel,
        StyleView: base.StyleView
      }
    });
    wManager.register({
      name: '@jupyter-widgets/controls',
      version: widgets.JUPYTER_CONTROLS_VERSION,
      exports: widgets
    });
    wManager.register({
      name: '@jupyter-widgets/output',
      version: OUTPUT_WIDGET_VERSION,
      exports: {OutputModel, OutputView}
    })
    this._registry.forEach(data => wManager.register(data));
    nb.rendermime.addFactory({
      safe: false,
      mimeTypes: [WIDGET_MIMETYPE],
      createRenderer: (options) => new WidgetRenderer(options, wManager)
    }, 0);
    return new DisposableDelegate(() => {
      if (nb.rendermime) {
        nb.rendermime.removeFactory(WIDGET_MIMETYPE);
      }
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
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetManagerProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterLab): INBWidgetExtension {
  let extension = new NBWidgetExtension();
  app.docRegistry.addWidgetExtension('Notebook', extension);
  return extension;
}
