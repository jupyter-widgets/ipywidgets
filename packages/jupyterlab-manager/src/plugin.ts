// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookModel, INotebookTracker
} from '@jupyterlab/notebook';

import {
  JupyterFrontEndPlugin, JupyterFrontEnd
} from '@jupyterlab/application';

import {
  DisposableDelegate
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
import {
  JUPYTER_CONTROLS_VERSION
} from '@jupyter-widgets/controls/lib/version';

import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';
const WIDGET_REGISTRY: base.IWidgetRegistryData[] = [];

export
function registerWidgetManager(context: DocumentRegistry.IContext<INotebookModel>, rendermime: RenderMimeRegistry) {
  const wManager = new WidgetManager(context, rendermime);
  WIDGET_REGISTRY.forEach(data => wManager.register(data));
  rendermime.addFactory({
    safe: false,
    mimeTypes: [WIDGET_MIMETYPE],
    createRenderer: (options) => new WidgetRenderer(options, wManager)
  }, 0);
  return new DisposableDelegate(() => {
    if (rendermime) {
      rendermime.removeMimeType(WIDGET_MIMETYPE);
    }
    wManager.dispose();
  });
}

/**
 * The widget manager provider.
 */
const widgetManagerProvider: JupyterFrontEndPlugin<base.IJupyterWidgetRegistry> = {
  id: 'jupyter.extensions.nbWidgetManager',
  requires: [INotebookTracker],
  provides: base.IJupyterWidgetRegistry,
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetManagerProvider;

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterFrontEnd, tracker: INotebookTracker): base.IJupyterWidgetRegistry {
  tracker.forEach(panel => {
    registerWidgetManager(panel.context, panel.content.rendermime);
  });
  tracker.widgetAdded.connect((sender, panel) => {
    registerWidgetManager(panel.context, panel.content.rendermime);
  });

  WIDGET_REGISTRY.push({
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

  WIDGET_REGISTRY.push({
    name: '@jupyter-widgets/controls',
    version: JUPYTER_CONTROLS_VERSION,
    exports: () => {
      return new Promise((resolve, reject) => {
        (require as any).ensure(['@jupyter-widgets/controls'], (require: NodeRequire) => {
          resolve(require('@jupyter-widgets/controls'));
        },
        (err: any) => {
          reject(err);
        },
        '@jupyter-widgets/controls'
        );
      });
    }
  });

  WIDGET_REGISTRY.push({
    name: '@jupyter-widgets/output',
    version: OUTPUT_WIDGET_VERSION,
    exports: {OutputModel, OutputView}
  });

  return {
    registerWidget(data: base.IWidgetRegistryData): void {
      WIDGET_REGISTRY.push(data);
    }
  };
}
