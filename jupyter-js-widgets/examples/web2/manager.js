var widgets = require('jupyter-js-widgets');
var PhosphorWidget = require('@phosphor/widgets').Widget;

require('@phosphor/widgets/style/index.css');
require('jupyter-js-widgets/css/widgets.built.css');
console.info('jupyter-js-widgets loaded successfully');

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    widgets.ManagerBase.call(this);
    this.el = el;
};
WidgetManager.prototype = Object.create(widgets.ManagerBase.prototype);

WidgetManager.prototype.display_view = function(msg, view, options) {
    var that = this;
    return Promise.resolve(view).then(function(view) {
        PhosphorWidget.attach(view.pWidget, that.el);
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

WidgetManager.prototype.loadClass = function(className, moduleName, moduleVersion) {
    if (moduleName === 'jupyter-js-widgets') {
        if (widgets[className]) {
            return Promise.resolve(widgets[className]);
        } else {
            return Promise.reject('Cannot find class ' + className)
        }
    } else {
        return Promise.reject('Cannot find module ' + moduleName);
    }
}

WidgetManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};

WidgetManager.prototype._create_comm = function() {
    return Promise.resolve({
        on_close: () => {},
        on_msg: () => {},
        close: () => {},
        send: () => {}
    });
}
