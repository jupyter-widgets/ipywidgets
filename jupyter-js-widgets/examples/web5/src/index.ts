import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

import {
    WidgetManager
} from './manager';

import {
    Kernel
} from '@jupyterlab/services';

document.addEventListener("DOMContentLoaded", function(event) {
    var baseUrl = "https://tmp60.tmpnb.org/";
    var apiUrl = baseUrl.concat("api/spawn");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", apiUrl, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");

    xmlhttp.onreadystatechange = function () {
        //Call a function when the state changes.
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let serverUrl = baseUrl.concat(JSON.parse(xmlhttp.responseText).url);
            let wsUrl = 'ws:' + serverUrl.split(':').slice(1).join(':');

            // Connect to the notebook webserver.
            let connectionInfo = {
                baseUrl: serverUrl,
                wsUrl: wsUrl
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
                kernel.execute({ code: code });
            });
        }
    }
    xmlhttp.send();
});
