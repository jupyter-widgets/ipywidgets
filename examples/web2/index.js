var CodeMirror = require("codemirror");
require("codemirror/lib/codemirror.css");
require("codemirror/mode/python/python");
var WidgetManager = require("./manager").WidgetManager;

require('@jupyter-widgets/controls/css/widgets.built.css');
require('font-awesome/css/font-awesome.css');

document.addEventListener("DOMContentLoaded", function(event) {

    var code = require("./widget_code.json").join("\n");
    var inputarea = document.getElementsByClassName("inputarea")[0];
    var editor = CodeMirror(inputarea, {
        value: code,
        mode: "python",
        tabSize: 4,
        showCursorWhenSelecting: true,
        viewportMargin: Infinity,
        readOnly: true
    });

    var state = require("./widget_state.json");
    var widgetarea = document.getElementsByClassName("widgetarea")[0];
    var manager = new WidgetManager(widgetarea);
    manager.set_state(state).then(function (models) {
        manager.display_model(undefined, models.find(function(element) {
            return element.model_id == "8621699ecc804983a612f09b7dfe806b";
        }));
    });
});
