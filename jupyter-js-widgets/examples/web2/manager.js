var widgets = require('jupyter-js-widgets');
require('jquery-ui/themes/base/all.css');
require('jupyter-js-widgets/css/widgets.min.css');

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
        that.el.appendChild(view.el);
        view.trigger('displayed');
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
