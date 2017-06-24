var widgets = require('jupyter-js-widgets');
var PhosphorWidget = require('@phosphor/widgets').Widget;
var ManagerBase = widgets.ManagerBase;
console.info('jupyter-js-widgets loaded successfully');

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    ManagerBase.call(this);
    this.el = el;
};
WidgetManager.prototype = Object.create(ManagerBase.prototype);

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
