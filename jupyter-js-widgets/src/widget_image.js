// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var _ = require('underscore');

var ImageModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'ImageModel',
        _view_name: 'ImageView',
        format: 'png',
        width: '',
        height: '',
        _b64value: ''
    })
});

var ImageView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Called when view is instantiated.
         */
        this.setElement(document.createElement('img'));
        ImageView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.className = 'jupyter-widgets widget-image';
        this.update(); // Set defaults.
    },

    update : function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var image_src = 'data:image/' + this.model.get('format') + ';base64,' + this.model.get('_b64value');
        this.el.setAttribute('src', image_src);

        var width = this.model.get('width');
        if (width !== undefined && width.length > 0) {
            this.el.setAttribute('width', width);
        } else {
            this.el.removeAttribute('width');
        }

        var height = this.model.get('height');
        if (height !== undefined && height.length > 0) {
            this.el.setAttribute('height', height);
        } else {
            this.el.removeAttribute('height');
        }
        return ImageView.__super__.update.apply(this);
    }
});

module.exports = {
    ImageView: ImageView,
    ImageModel: ImageModel
};
