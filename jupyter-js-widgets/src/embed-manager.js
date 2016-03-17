// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var manager = require('./manager-base');

var EmbedManager = exports.EmbedManager = function() {
    manager.ManagerBase.call(this);
};
EmbedManager.prototype = Object.create(manager.ManagerBase.prototype);

EmbedManager.prototype.display_widget_state = function(models, el) {
    this.set_state(models, { el });
};

EmbedManager.prototype.display_view = function(msg, view, options) {
    return Promise.resolve(view).then(function(view) {
        options.el.appendChild(view.el);
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

EmbedManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};
