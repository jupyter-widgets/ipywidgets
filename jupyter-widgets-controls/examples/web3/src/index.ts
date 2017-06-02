import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

import {
    WidgetManager
} from './manager';

import {
    Kernel
} from '@jupyterlab/services';

let BASEURL = prompt('Notebook BASEURL', 'http://localhost:8888');
let WSURL = 'ws:' + BASEURL.split(':').slice(1).join(':');

document.addEventListener("DOMContentLoaded", function(event) {

    // Connect to the notebook webserver.
    let connectionInfo = {
        baseUrl: BASEURL,
        wsUrl: WSURL
    };
    Kernel.getSpecs(connectionInfo).then(kernelSpecs => {
        (connectionInfo as any).name = kernelSpecs.default;
        return Kernel.startNew(connectionInfo);
    }).then(kernel => {

        // Create a codemirror instance
        let code = require('../widget_code.json').join("\n");
        let inputarea = document.getElementsByClassName("inputarea")[0] as HTMLElement;
        let editor = CodeMirror(inputarea, {
            value: code,
            mode: "python",
            tabSize: 4,
            showCursorWhenSelecting: true,
            viewportMargin: Infinity,
            readOnly: true
        });

        // Create the widget area and widget manager
        let widgetarea = document.getElementsByClassName("widgetarea")[0];
        let manager = new WidgetManager(kernel, widgetarea);

        // Run backend code to create the widgets.  You could also create the
        // widgets in the frontend, like the other widget examples demonstrate.
        kernel.requestExecute({ code: code });
    });
});
