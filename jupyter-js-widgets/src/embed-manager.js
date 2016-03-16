// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var manager = require('./manager-base');

var EmbedManager = exports.EmbedManager = function(el) {
    //  Call the base class.
    manager.ManagerBase.call(this);
    this.el = el;
};
EmbedManager.prototype = Object.create(manager.ManagerBase.prototype);

EmbedManager.prototype.display_widget_state = function(models, el) {
    // TODO: Add ability to display state subsets in a specific element.
}

EmbedManager.prototype.display_view = function(msg, view, options) {
    var that = this;
    return Promise.resolve(view).then(function(view) {
        that.el.appendChild(view.el);
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

EmbedManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};
