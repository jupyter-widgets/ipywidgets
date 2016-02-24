// require('jquery-ui/themes/smoothness/jquery-ui.min.css');

var widgets = require('jupyter-js-widgets');
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
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

WidgetManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};
