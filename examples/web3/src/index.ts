import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'font-awesome/css/font-awesome.css';
import { WidgetManager } from './manager';

import {
  KernelManager,
  ServerConnection,
  KernelMessage,
} from '@jupyterlab/services';

const BASEURL = prompt('Notebook BASEURL', 'http://localhost:8888');
if (BASEURL === null) {
  alert('A base URL is needed to run the example!');
  throw new Error('A base URL is needed to run the example!');
}
const WSURL = 'ws:' + BASEURL.split(':').slice(1).join(':');

document.addEventListener('DOMContentLoaded', async function (event) {
  // Connect to the notebook webserver.
  const connectionInfo = ServerConnection.makeSettings({
    baseUrl: BASEURL!,
    wsUrl: WSURL,
  });
  const kernelManager = new KernelManager({ serverSettings: connectionInfo });
  const kernel = await kernelManager.startNew();

  // Create a codemirror instance
  const code = require('../widget_code.json').join('\n');
  const inputarea = document.getElementsByClassName(
    'inputarea',
  )[0] as HTMLElement;
  CodeMirror(inputarea, {
    value: code,
    mode: 'python',
    tabSize: 4,
    showCursorWhenSelecting: true,
    viewportMargin: Infinity,
    readOnly: true,
  });

  // Create the widget area and widget manager
  const widgetarea = document.getElementsByClassName(
    'widgetarea',
  )[0] as HTMLElement;
  const manager = new WidgetManager(kernel);

  // Run backend code to create the widgets.  You could also create the
  // widgets in the frontend, like the other widget examples demonstrate.
  const execution = kernel.requestExecute({ code: code });
  execution.onIOPub = async (msg): Promise<void> => {
    // If we have a display message, display the widget.
    if (KernelMessage.isDisplayDataMsg(msg)) {
      const widgetData: any =
        msg.content.data['application/vnd.jupyter.widget-view+json'];
      if (widgetData !== undefined && widgetData.version_major === 2) {
        if (manager.has_model(widgetData.model_id)) {
          const model = await manager.get_model(widgetData.model_id)!;
          manager.display_view(manager.create_view(model), widgetarea);
        }
      }
    }
  };
});
