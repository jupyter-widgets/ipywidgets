require('./node_modules/ipywidgets/static/components/bootstrap/css/bootstrap.css')
require('./node_modules/jquery-ui/themes/smoothness/jquery-ui.min.css')

var ipywidgets = require('ipywidgets');
console.info('ipywidgets loaded successfully');

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    ipywidgets.ManagerBase.call(this);
    this.el = el;
};
WidgetManager.prototype = Object.create(ipywidgets.ManagerBase.prototype);

WidgetManager.prototype.display_view = function(msg, view, options) {
    var that = this;
    return Promise.resolve(view).then(function(view) {
        that.el.appendChild(view.el);
        view.on('remove', function() {
            console.log('view removed', view);
        });
        return view;
    });
};

WidgetManager.prototype._create_comm = function(comm_target_name, model_id, metadata) {
    function nullFunction() {}
    return Promise.resolve({
        on_close: nullFunction,
        on_msg: nullFunction,
        send: nullFunction
    });
};

WidgetManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};
