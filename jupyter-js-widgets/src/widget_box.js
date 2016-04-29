// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var _ = require('underscore');

var BoxModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _view_name: 'BoxView',
        _model_name: 'BoxModel',
        children: [],
        box_style: '',
        overflow_x: '',
        overflow_y: ''
    })
}, {
    serializers: _.extend({
        children: {deserialize: widget.unpack_models},
    }, widget.DOMWidgetModel.serializers)
});

var ProxyModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _view_name: 'ProxyView',
        _model_name: 'ProxyModel',
        child: null
    })
}, {
    serializers: _.extend({
        child: {deserialize: widget.unpack_models}
    }, widget.DOMWidgetModel.serializers)
});

var ProxyView = widget.DOMWidgetView.extend({
    initialize: function() {
        // Public constructor
        ProxyView.__super__.initialize.apply(this, arguments);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-container');
        this.box = this.el;
        this.child_promise = Promise.resolve();
    },

    render: function() {
        var that = this;
        var child_view = this.set_child(this.model.get('child'));
        this.listenTo(this.model, 'change:child', function(model, value) {
            this.set_child(value);
        });
        return child_view;
    },

    remove: function() {
        ProxyView.__super__.remove.apply(this, arguments);
        var that = this;
        this.child_promise.then(function() {
            if (that.child) {
                that.child.remove();
            }
        });
    },

    set_child: function(value) {
        if (this.child) {
            this.child.remove();
        }
        if (value) {
            var that = this;
            this.child_promise = this.child_promise.then(function() {
                return that.create_child_view(value).then(function(view) {
                    if (!that.box) {
                        console.error('Widget place holder does not exist');
                        return;
                    }
                    while (that.box.firstChild) {
                        that.box.removeChild(that.box.firstChild);
                    }
                    that.box.appendChild(view.el);

                    // Trigger the displayed event of the child view.
                    that.displayed.then(function() {
                        view.trigger('displayed', that);
                    });
                    that.child = view;
                    that.trigger('child:created');
                }).catch(utils.reject('Could not add child view to proxy', true));
            });
        }
        return this.child_promise;
    },

    /**
     * Set a CSS attr of the view
     * @param  {string} name
     * @param  {object} value
     */
    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        this.box.style[name] = value;
    }
});

var PlaceProxyModel = ProxyModel.extend({
    defaults: _.extend({}, ProxyModel.prototype.defaults, {
        _view_name: 'PlaceProxyView',
        _model_name: 'PlaceProxyModel',
        selector: ''
    })
});

var PlaceProxyView = ProxyView.extend({
    initialize: function() {
        PlaceProxyView.__super__.initialize.apply(this, arguments);
        this.update_selector(this.model, this.model.get('selector'));
        this.listenTo(this.model, 'change:selector', this.update_selector);
    },

    update_selector: function(model, selector) {
        this.box = selector && document.querySelector(selector) || this.el;
        this.set_child(this.model.get('child'));
    }
});

var BoxView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Public constructor
         */
        BoxView.__super__.initialize.apply(this, arguments);
        this.children_views = new widget.ViewList(this.add_child_model, null, this);
        this.listenTo(this.model, 'change:children', function(model, value) {
            this.children_views.update(value);
        }, this);
        this.listenTo(this.model, 'change:overflow_x', this.update_overflow_x, this);
        this.listenTo(this.model, 'change:overflow_y', this.update_overflow_y, this);
        this.listenTo(this.model, 'change:box_style', this.update_box_style, this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        this.box.style[name] = value;
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-container');
        this.el.classList.add('widget-box');
        this.box = this.el;

        this.children_views.update(this.model.get('children'));
        this.update_overflow_x();
        this.update_overflow_y();
        this.update_box_style();
    },

    update_overflow_x: function() {
        /**
         * Called when the x-axis overflow setting is changed.
         */
        this.box.style.overflowX = this.model.get('overflow_x');
    },

    update_overflow_y: function() {
        /**
         * Called when the y-axis overflow setting is changed.
         */
        this.box.style.overflowY = this.model.get('overflow_y');
    },

    update_box_style: function() {
        var class_map = {
            success: ['alert', 'alert-success'],
            info: ['alert', 'alert-info'],
            warning: ['alert', 'alert-warning'],
            danger: ['alert', 'alert-danger']
        };
        this.update_mapped_classes(class_map, 'box_style', this.box);
    },

    add_child_model: function(model) {
        /**
         * Called when a model is added to the children list.
         */
        var that = this;
        // we insert a dummy element so the order is preserved when we add
        // the rendered content later.
        var dummy = document.createElement('div');
        that.box.appendChild(dummy);

        return this.create_child_view(model).then(function(view) {
            that.box.replaceChild(view.el, dummy);

            // Trigger the displayed event of the child view.
            that.displayed.then(function() {
                view.trigger('displayed', that);
            });
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    },

    remove: function() {
        /**
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        BoxView.__super__.remove.apply(this, arguments);
        this.children_views.remove();
    }
});

var FlexBoxModel = BoxModel.extend({ // TODO: Deprecated in 5.0 (entire model)
    defaults: _.extend({}, BoxModel.prototype.defaults, {
        _view_name: 'FlexBoxView',
        _model_name: 'FlexBoxModel',
        orientation: 'vertical',
        pack: 'start',
        alignt: 'start'
    })
});

var FlexBoxView = BoxView.extend({ // TODO: Deprecated in 5.0 (entire view)
    render: function() {
        FlexBoxView.__super__.render.apply(this);
        this.listenTo(this.model, 'change:orientation', this.update_orientation, this);
        this.listenTo(this.model, 'change:flex', this._flex_changed, this);
        this.listenTo(this.model, 'change:pack', this._pack_changed, this);
        this.listenTo(this.model, 'change:align', this._align_changed, this);
        this._flex_changed();
        this._pack_changed();
        this._align_changed();
        this.update_orientation();
    },

    update_orientation: function() {
        var orientation = this.model.get('orientation');
        if (orientation == 'vertical') {
            this.box.classList.remove('hbox');
            this.box.classList.add('vbox');
        } else {
            this.box.classList.remove('vbox');
            this.box.classList.add('hbox');
        }
    },

    _flex_changed: function() {
        if (this.model.previous('flex')) {
            this.box.classList.remove('box-flex' + this.model.previous('flex'));
        }
        this.box.classList.add('box-flex' + this.model.get('flex'));
    },

    _pack_changed: function() {
        if (this.model.previous('pack')) {
            this.box.classList.remove(this.model.previous('pack'));
        }
        this.box.classList.add(this.model.get('pack'));
    },

    _align_changed: function() {
        if (this.model.previous('align')) {
            this.box.classList.remove('align-' + this.model.previous('align'));
        }
        this.box.classList.add('align-' + this.model.get('align'));
    }
});

module.exports = {
    BoxModel: BoxModel,
    BoxView: BoxView,
    FlexBoxModel: FlexBoxModel, // TODO: Deprecated in 5.0
    FlexBoxView: FlexBoxView, // TODO: Deprecated in 5.0
    ProxyModel: ProxyModel,
    ProxyView: ProxyView,
    PlaceProxyModel: PlaceProxyModel,
    PlaceProxyView: PlaceProxyView
};
