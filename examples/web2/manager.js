var base = require('@jupyter-widgets/base');
var ManagerBase = require('@jupyter-widgets/base-manager').ManagerBase;
var controls = require('@jupyter-widgets/controls');
var LuminoWidget = require('@lumino/widgets').Widget;

class WidgetManager extends ManagerBase {
  constructor(el) {
    super();
    this.el = el;
  }

  loadClass(className, moduleName, moduleVersion) {
    return new Promise(function(resolve, reject) {
      if (moduleName === '@jupyter-widgets/controls') {
        resolve(controls);
      } else if (moduleName === '@jupyter-widgets/base') {
        resolve(base);
      } else {
        var fallback = function(err) {
          let failedId = err.requireModules && err.requireModules[0];
          if (failedId) {
            console.log(
              `Falling back to jsDelivr for ${moduleName}@${moduleVersion}`
            );
            window.require(
              [
                `https://cdn.jsdelivr.net/npm/${moduleName}@${moduleVersion}/dist/index.js`
              ],
              resolve,
              reject
            );
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
        return Promise.reject(
          `Class ${className} not found in module ${moduleName}@${moduleVersion}`
        );
      }
    });
  }

  display_view(view) {
    var that = this;
    return Promise.resolve(view).then(function(view) {
      LuminoWidget.attach(view.luminoWidget, that.el);
      return view;
    });
  }

  _get_comm_info() {
    return Promise.resolve({});
  }

  _create_comm() {
    return Promise.reject('no comms available');
  }
}

exports.WidgetManager = WidgetManager;
