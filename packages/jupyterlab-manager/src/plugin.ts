// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookModel, INotebookTracker, Notebook
} from '@jupyterlab/notebook';

import {
  JupyterFrontEndPlugin, JupyterFrontEnd
} from '@jupyterlab/application';

import {
  RenderMimeRegistry, IRenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
  CodeCell
} from '@jupyterlab/cells';

import {
  each
} from '@phosphor/algorithm';

import {
  DisposableDelegate
} from '@phosphor/disposable';

import {
  AttachedProperty
} from '@phosphor/properties';

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

// We import only the version from the specific module in controls so that the
// controls code can be split and dynamically loaded in webpack.
import {
  JUPYTER_CONTROLS_VERSION
} from '@jupyter-widgets/controls/lib/version';

import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';
const WIDGET_REGISTRY: base.IWidgetRegistryData[] = [];

export
function registerWidgetManager(nb: Notebook, context: DocumentRegistry.IContext<INotebookModel>, rendermime: RenderMimeRegistry) {
  let wManager = Private.widgetManagerProperty.get(context);
  if (!wManager) {
    wManager = new WidgetManager(context, rendermime);
    WIDGET_REGISTRY.forEach(data => wManager.register(data));
    Private.widgetManagerProperty.set(context, wManager);
  }

  // For any widgets that have already been rendered with the placeholder, set
  // the renderer. This iteration structure is closely tied to the structure of
  // the notebook widget.
  nb.widgets.forEach(cell => {
    if (cell.model.type === 'code') {
      (cell as CodeCell).outputArea.widgets.forEach(w => {
        // Need to use phosphor iteration functions for .children()
        each(w.children(), r => {
          if (r instanceof WidgetRenderer) {
            r.manager = wManager;
          }
        });
      });
    }
  });

  // Replace the placeholder widget renderer with one bound to this widget
  // manager.
  rendermime.removeMimeType(WIDGET_MIMETYPE);
  rendermime.addFactory(
    {
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
  requires: [INotebookTracker, IRenderMimeRegistry],
  provides: base.IJupyterWidgetRegistry,
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetManagerProvider;

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterFrontEnd, tracker: INotebookTracker, rendermime: IRenderMimeRegistry): base.IJupyterWidgetRegistry {
  // Add a placeholder widget renderer.
  rendermime.addFactory(
    {
      safe: false,
      mimeTypes: [WIDGET_MIMETYPE],
      createRenderer: options => new WidgetRenderer(options)
    },
    0
  );

  tracker.forEach(panel => {
    registerWidgetManager(panel.content, panel.context, panel.content.rendermime);
  });
  tracker.widgetAdded.connect((sender, panel) => {
    registerWidgetManager(panel.content, panel.context, panel.content.rendermime);
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

namespace Private {
  /**
   * A private attached property for a widget manager.
   */
  export const widgetManagerProperty = new AttachedProperty<
    DocumentRegistry.Context,
    WidgetManager | undefined
  >({
    name: 'widgetManager',
    create: () => undefined
  });
}
