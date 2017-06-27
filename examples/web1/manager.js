var base = require('@jupyter-widgets/base');
var controls = require('@jupyter-widgets/controls');
var PhosphorWidget = require('@phosphor/widgets').Widget;

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    base.ManagerBase.call(this);
    this.el = el;
};

WidgetManager.prototype = Object.create(base.ManagerBase.prototype);

WidgetManager.prototype.loadClass = function(className, moduleName, moduleVersion) {
    return new Promise(function(resolve, reject) {
        if (moduleName === '@jupyter-widgets/controls') {
            resolve(controls);
        } else if (moduleName === '@jupyter-widgets/base') {
            resolve(base)
        } else {
            var fallback = function(err) {
                let failedId = err.requireModules && err.requireModules[0];
                if (failedId) {
                    console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
                    window.require([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`], resolve, reject);
                } else {
                    throw err;
                }
            };
            window.require([`${moduleName}.js`], resolve, fallback);
        }
    }).then(function(module) {
        if (module[className]) {
            return module[className];
        } else {
            return Promise.reject(`Class ${className} not found in module ${moduleName}@${moduleVersion}`);
        }
    });
}

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
    return Promise.reject('no comms available');
}
