var jpywidgets = require('jupyter-js-widgets');
console.info('jupyter-js-widgets loaded successfully');

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    jpywidgets.ManagerBase.call(this);
    this.el = el;

    // Create a style tag that will be used to apply stateful styling to the
    // widgets.  Using a style tag allows us to clear/undo the styling.
    this.styleTag = document.createElement('style');
    this.styleTag.type = 'text/css';
    document.querySelectorAll('body')[0].appendChild(this.styleTag);
};
WidgetManager.prototype = Object.create(jpywidgets.ManagerBase.prototype);

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

WidgetManager.prototype.setCSS = function(css) {
    if (this.styleTag.styleSheet) {
        this.styleTag.styleSheet.cssText = css;
    } else {
        this.styleTag.appendChild(document.createTextNode(css));
    }
};
