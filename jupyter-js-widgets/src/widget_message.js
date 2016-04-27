// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var _ = require('underscore');


var MessageWidgetModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'MessageWidgetModel',
        value: [],
        disabled: false,
        description: ''
    })
});


var MessageWidgetView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-message');

        this.update();
    },

    update: function() {
        /**
         * Update the contents of this view.
         *
         * Called when the model is changed.
         */
        console.log('Update called on: MESSAGE WIDGET');
        while (this.el.firstChild) {
         this.el.removeChild(this.el.firstChild);
        }

        let items = this.model.get('stored_messages');
        var el = this.el;
        _.each(items, function(item) {
          console.log('Iterating over STORED MESSAGES');
          var label = document.createElement('div');
          label.textContent = item['content']['data']['text/plain'];
          el.appendChild(label);
        });
    }
});

module.exports = {
    MessageWidgetView: MessageWidgetView,
    MessageWidgetModel: MessageWidgetModel
};
