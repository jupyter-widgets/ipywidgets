// Create a widget manager instance.
var WidgetManager = require("./manager").WidgetManager;

document.addEventListener("DOMContentLoaded", function(event) {

    var manager = new WidgetManager(document.body);

    var state = require("./widget_state.json");

    manager.set_state(state);
});
