// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var manager = require('./manager-base');

var EmbedManager = exports.EmbedManager = function() {
    manager.ManagerBase.call(this);
};
EmbedManager.prototype = Object.create(manager.ManagerBase.prototype);

EmbedManager.prototype.display_widget_state = function(models, el) {
    return this.set_state(models, { el: el, displayOnce: true });
};

EmbedManager.prototype.display_view = function(msg, view, options) {
    return Promise.resolve(view).then(function(view) {
        options.el.appendChild(view.el);
        view.trigger('displayed');
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

EmbedManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};

EmbedManager.prototype.require_error = function(success_callback) {
    /**
     * Takes a requirejs success handler and returns a requirejs error handler
     * that attempts loading the module from npmcdn. 
     */
    return function(err) {
        var failedId = err.requireModules && err.requireModules[0];
        if (failedId) {
            window.require(['https://npmcdn.com/' + failedId + '/dist/index.js'], success_callback);
        } else {
            throw err;
        }
    };
};
