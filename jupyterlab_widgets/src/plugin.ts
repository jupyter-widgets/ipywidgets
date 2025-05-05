// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import { ISettingRegistry } from '@jupyterlab/settingregistry';
import * as nbformat from '@jupyterlab/nbformat';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookModel, INotebookTracker, Notebook, NotebookPanel
} from '@jupyterlab/notebook';

import {
  JupyterFrontEndPlugin, JupyterFrontEnd
} from '@jupyterlab/application';

import {
  IMainMenu,
} from '@jupyterlab/mainmenu';

import {
  IRenderMimeRegistry
} from '@jupyterlab/rendermime';

import {
  ILoggerRegistry, LogLevel
} from '@jupyterlab/logconsole';

import {
  CodeCell
} from '@jupyterlab/cells';

import {
  toArray, filter
} from '@lumino/algorithm';

import {
  DisposableDelegate
} from '@lumino/disposable';

import {
  AttachedProperty
} from '@lumino/properties';

import {
  WidgetRenderer
} from './renderer';

import {
  WidgetManager, WIDGET_VIEW_MIMETYPE
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
import { KernelMessage } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';

class WidgetRegistry {
  get widgets(): base.IWidgetRegistryData[] {
    return [...this._registry];
  }

  push(data: base.IWidgetRegistryData) {
    this._registry.push(data);
    this._widgetRegistered.emit(data);
  }

  get widgetRegistered(): ISignal<WidgetRegistry, base.IWidgetRegistryData> {
    return this._widgetRegistered;
  }

  private _widgetRegistered = new Signal<
    WidgetRegistry,
    base.IWidgetRegistryData
  >(this);

  private _registry: base.IWidgetRegistryData[] = [];
}

const WIDGET_REGISTRY = new WidgetRegistry();

/**
 * The cached settings.
 */
const SETTINGS: WidgetManager.Settings = { saveState: false };

/**
 * Iterate through all widget renderers in a notebook.
 */
function* widgetRenderers(nb: Notebook) {
  for (let cell of nb.widgets) {
    if (cell.model.type === 'code') {
      for (let codecell of (cell as CodeCell).outputArea.widgets) {
        for (let output of toArray(codecell.children())) {
          if (output instanceof WidgetRenderer) {
            yield output;
          }
        }
      }
    }
  }
}

/**
 * Iterate through all matching linked output views
 */
function* outputViews(app: JupyterFrontEnd, path: string) {
  let linkedViews = filter(
    app.shell.widgets(),
    w => w.id.startsWith('LinkedOutputView-') && (w as any).path === path
  );
  for (let view of toArray(linkedViews)) {
    for (let outputs of toArray(view.children())) {
      for (let output of toArray(outputs.children())) {
        if (output instanceof WidgetRenderer) {
          yield output;
        }
      }
    }
  }
}

function* chain<T>(...args: IterableIterator<T>[]) {
  for (let it of args) {
    yield* it;
  }
}

export function registerWidgetManager(
  context: DocumentRegistry.IContext<INotebookModel>,
  rendermime: IRenderMimeRegistry,
  renderers: IterableIterator<WidgetRenderer>
) {
  let wManager = Private.widgetManagerProperty.get(context);
  if (!wManager) {
    wManager = new WidgetManager(context, rendermime, SETTINGS);
    WIDGET_REGISTRY.widgets.forEach(data => wManager.register(data));
    WIDGET_REGISTRY.widgetRegistered.connect((_, data) => {
      wManager.register(data);
    });
    Private.widgetManagerProperty.set(context, wManager);
  }

  for (let r of renderers) {
    r.manager = wManager;
  }

  // Replace the placeholder widget renderer with one bound to this widget
  // manager.
  rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
  rendermime.addFactory(
    {
    safe: false,
    mimeTypes: [WIDGET_VIEW_MIMETYPE],
      createRenderer: (options) => new WidgetRenderer(options, wManager)
    }, 0);

  return new DisposableDelegate(() => {
    if (rendermime) {
      rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    }
    wManager.dispose();
  });
}

/**
 * The widget manager provider.
 */
const plugin: JupyterFrontEndPlugin<base.IJupyterWidgetRegistry> = {
  id: '@jupyter-widgets/jupyterlab-manager:plugin',
  requires: [IRenderMimeRegistry, ISettingRegistry],
  optional: [INotebookTracker, IMainMenu, ILoggerRegistry],
  provides: base.IJupyterWidgetRegistry,
  activate: activateWidgetExtension,
  autoStart: true
};

export default plugin;


function updateSettings(settings: ISettingRegistry.ISettings) {
  SETTINGS.saveState = settings.get('saveState').composite as boolean;
}

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: JupyterFrontEnd,
  rendermime: IRenderMimeRegistry,
  settingRegistry: ISettingRegistry,
  tracker: INotebookTracker | null,
  menu: IMainMenu | null,
  loggerRegistry: ILoggerRegistry | null): base.IJupyterWidgetRegistry {

  const {commands} = app;

  const bindUnhandledIOPubMessageSignal = (nb: NotebookPanel) => {
    if (!loggerRegistry) {
      return;
    }

    const wManager = Private.widgetManagerProperty.get(nb.context);
    if (wManager) {
      wManager.onUnhandledIOPubMessage.connect(
        (sender: WidgetManager, msg: KernelMessage.IIOPubMessage) => {
          const logger = loggerRegistry.getLogger(nb.context.path);
          let level: LogLevel = 'warning';
          if (
            KernelMessage.isErrorMsg(msg) ||
            (KernelMessage.isStreamMsg(msg) && msg.content.name === 'stderr')
          ) {
            level = 'error';
          }
          const data: nbformat.IOutput = {
            ...msg.content,
            output_type: msg.header.msg_type
          };
          logger.rendermime = nb.content.rendermime;
          logger.log({type: 'output', data, level});
      });
    }
  };

  settingRegistry.load(plugin.id).then((settings: ISettingRegistry.ISettings) => {
    settings.changed.connect(updateSettings);
    updateSettings(settings);
  }).catch((reason: Error) => {
    console.error(reason.message);
  });

  // Add a placeholder widget renderer.
  rendermime.addFactory(
    {
      safe: false,
      mimeTypes: [WIDGET_VIEW_MIMETYPE],
      createRenderer: options => new WidgetRenderer(options)
    },
    0
  );

  if (tracker) {
    tracker.forEach(panel => {
      registerWidgetManager(
        panel.context,
        panel.content.rendermime,
        chain(
          widgetRenderers(panel.content),
          outputViews(app, panel.context.path)
        )
      );

      bindUnhandledIOPubMessageSignal(panel);
    });
    tracker.widgetAdded.connect((sender, panel) => {
      registerWidgetManager(
        panel.context,
        panel.content.rendermime,
        chain(
          widgetRenderers(panel.content),
          outputViews(app, panel.context.path)
        )
      );

      bindUnhandledIOPubMessageSignal(panel);
    });
  }

  // Add a command for creating a new Markdown file.
  commands.addCommand('@jupyter-widgets/jupyterlab-manager:saveWidgetState', {
    label: 'Save Widget State Automatically',
    execute: args => {
      return settingRegistry
        .set(plugin.id, 'saveState', !SETTINGS.saveState)
        .catch((reason: Error) => {
          console.error(`Failed to set ${plugin.id}: ${reason.message}`);
        });
    },
    isToggled: () => SETTINGS.saveState
  });

  if (menu) {
    menu.settingsMenu.addGroup([
      {command: '@jupyter-widgets/jupyterlab-manager:saveWidgetState'}
    ]);
  }

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
