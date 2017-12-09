import 'font-awesome/css/font-awesome.css';
import {
    WidgetManager
} from './manager';

import {
    WidgetRenderer
} from '@jupyter-widgets/html-manager';

import {
    Kernel, ServerConnection, KernelMessage, ContentsManager, Drive
} from '@jupyterlab/services';

import {
    nbformat
} from '@jupyterlab/coreutils';

import {
    OutputArea, OutputAreaModel, IOutputPrompt
} from '@jupyterlab/outputarea';

import {
    RenderMime, MimeModel, defaultRendererFactories
} from '@jupyterlab/rendermime';

import {
    Widget
} from '@phosphor/widgets';

let BASEURL = prompt('Notebook BASEURL', 'http://localhost:8888');
let WSURL = 'ws:' + BASEURL.split(':').slice(1).join(':');
let NOTEBOOK = 'TestNotebook.ipynb';
const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

document.addEventListener('DOMContentLoaded', async function(event) {

    // Connect to the notebook webserver.
    const connectionInfo = ServerConnection.makeSettings({
        baseUrl: BASEURL,
        wsUrl: WSURL
    });

    // Set up an output area and rendermime

    // Add widget manager to the rendermime

    // Get the notebook

    const drive = new Drive({serverSettings: connectionInfo});
    const model = await drive.get(NOTEBOOK, {type: 'notebook', content: true});
    const nb: nbformat.INotebookContent = model.content;

    // validate the notebook model


    // Validate we have the right kernel
    const kernelSpecs = await Kernel.getSpecs(connectionInfo);
    const kernelName = nb.metadata.kernelspec.name;
    if (!kernelSpecs.kernelspecs[kernelName]) {
        throw new Error(`Could not find kernel ${kernelName}`);
    }

    // launch notebook kernel (not a session - since this is a read-only
    // interface, we want separate pages to access separate kernel instances)
    const kernel = await Kernel.startNew({
        name: kernelName,
        serverSettings: connectionInfo
    });

    // Set up a rendermime
    const rendermime = new RenderMime({
        initialFactories: defaultRendererFactories
    });

    // Register the widget manager with the kernel
    let wManager = new WidgetManager({kernel, rendermime})

    rendermime.addFactory({
        safe: false,
        mimeTypes: [WIDGET_MIMETYPE],
        createRenderer: (options) => new WidgetRenderer(options, wManager)
      }, 0)

    // Register the widget renderer with the rendermime




    let execute_code = (code: string, output: OutputArea, kernel: Kernel.IKernel): Promise<KernelMessage.IExecuteReplyMsg> => {
        // based on https://github.com/jupyterlab/jupyterlab/blob/09884af82886c630d0f2fa662d6f8a1525613100/packages/outputarea/src/widget.ts#L466
        // Override the default for `stop_on_error`.
        let content: KernelMessage.IExecuteRequest = {
            code,
            stop_on_error: true
        };
        let future = kernel.requestExecute(content, false);
        output.future = future;
        return future.done as Promise<KernelMessage.IExecuteReplyMsg>;
    }

    // Could also just override the CSS for the output prompt.
    class OutputPrompt extends Widget implements IOutputPrompt {
        executionCount: number;
    }
    class ContentFactory extends OutputArea.ContentFactory {
        createOutputPrompt() {
            return new OutputPrompt();
        }
    }
    const contentFactory = new ContentFactory();

    // for each cell in the notebook, either render the markdown or execute the code cell
    for (let i = 0; i < nb.cells.length; i++) {
        let cell = nb.cells[i];
        if (Array.isArray(cell.source)) {
            cell.source = cell.source.join();
        }
        switch(cell.cell_type) {
        case 'code':
            let model = new OutputAreaModel({trusted: true});
            let outWidget = new OutputArea({model, rendermime, contentFactory})
            let div = document.createElement('div');
            Widget.attach(outWidget, document.body)
            console.log(`executing ${cell.source}`);
            await execute_code(cell.source, outWidget, kernel);
            break;
        case 'markdown':
            console.log(`rendering ${cell.source}`);
            let renderer = rendermime.createRenderer('text/markdown');
            let mimeModel = new MimeModel({ data: { 'text/markdown': cell.source }});
            renderer.renderModel(mimeModel);
            Widget.attach(renderer, document.body);
            break;
        default:
            break;
        }
    }

/*
    // Create the widget area and widget manager
    let widgetarea = document.getElementsByClassName('widgetarea')[0] as HTMLElement;
    let manager = new WidgetManager(kernel, widgetarea);

    // Run backend code to create the widgets.  You could also create the
    // widgets in the frontend, like the other widget examples demonstrate.
    let execution = kernel.requestExecute({ code: code });
    execution.onIOPub = (msg) => {
        // If we have a display message, display the widget.
        if (KernelMessage.isDisplayDataMsg(msg)) {
            let widgetData: any = msg.content.data['application/vnd.jupyter.widget-view+json'];
            if (widgetData !== undefined && widgetData.version_major === 2) {
                let model = manager.get_model(widgetData.model_id);
                if (model !== undefined) {
                    model.then(model => {
                        manager.display_model(msg, model);
                    });
                }
            }
        }
    };
*/


});

