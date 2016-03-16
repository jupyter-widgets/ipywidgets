require('jupyter-js-widgets/css/widgets.min.css');

var WidgetManager = require("./manager").WidgetManager;

window.w = function renderWidgetState (state) {
    console.info('Inserting widget(s)...');
    var widgetarea = document.createElement('div');
    widgetarea.className = 'jupyter-widgetarea'
    var manager = new WidgetManager(widgetarea);
    manager.set_state(state);
    var context = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0];
    context.parentElement.insertBefore(widgetarea, context);
};
