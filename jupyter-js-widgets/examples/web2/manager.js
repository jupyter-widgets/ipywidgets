var widgets = require('jupyter-js-widgets');
var PhosphorWidget = require('phosphor/lib/ui/widget').Widget;

require('jupyter-js-widgets/css/widgets.built.css');
require('phosphor/styles/base.css');
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
