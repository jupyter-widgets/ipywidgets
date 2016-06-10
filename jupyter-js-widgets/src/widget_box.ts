// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, unpack_models, ViewList
} from './widget';

import {
    reject
} from './utils';

import {
    Panel
} from 'phosphor-panel';

import {
    Widget
} from 'phosphor-widget';

import * as _ from 'underscore';

export
class BoxModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'BoxView',
            _model_name: 'BoxModel',
            children: [],
            box_style: '',
            overflow_x: '',
            overflow_y: ''
        });
    }

    static serializers = _.extend({
        children: {deserialize: unpack_models}
    }, DOMWidgetModel.serializers)
}

export
class ProxyModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'ProxyView',
            _model_name: 'ProxyModel',
            child: null            
        })
    }

    static serializers = _.extend({
        child: {deserialize: unpack_models}        
    }, DOMWidgetModel.serializers);
}

export
class ProxyView extends DOMWidgetView {
    initialize(parameters) {
        // Public constructor
        super.initialize(parameters);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-container');
        this.box = this.el;
        this.child_promise = Promise.resolve();
    }

    render() {
        var that = this;
        var child_view = this.set_child(this.model.get('child'));
        this.listenTo(this.model, 'change:child', function(model, value) {
            this.set_child(value);
        });
        return child_view;
    }

    remove() {
        super.remove();
        this.child_promise.then(() => {
            if (this.child) {
                this.child.remove();
            }
        });
    }

    set_child(value) {
        if (this.child) {
            this.child.remove();
        }
        if (value) {
            this.child_promise = this.child_promise.then(() => {
                return this.create_child_view(value).then((view) => {
                    if (!this.box) {
                        console.error('Widget place holder does not exist');
                        return;
                    }
                    while (this.box.firstChild) {
                        this.box.removeChild(this.box.firstChild);
                    }
                    this.box.appendChild(view.el);

                    // Trigger the displayed event of the child view.
                    this.displayed.then(() => {
                        view.trigger('displayed', this);
                    });
                    this.child = view;
                    this.trigger('child:created');
                }).catch(reject('Could not add child view to proxy', true));
            });
        }
        return this.child_promise;
    }

    /**
     * Set a CSS attr of the view
     * @param  {string} name
     * @param  {object} value
     */
    update_attr(name, value) { // TODO: Deprecated in 5.0
        this.box.style[name] = value;
    }
    box: any;
    /**
     * TODO: Should be Promise<DOMWidgetView>, but we set it to Promise<void> at the start. Why???
     */
    child_promise: Promise<any>;
    child: any;

}

export
class PlaceProxyModel extends ProxyModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'PlaceProxyView',
            _model_name: 'PlaceProxyModel',
            selector: ''          
        })
    }
}

export
class PlaceProxyView extends ProxyView {
    initialize(parameters) {
        super.initialize(parameters);
        this.update_selector(this.model, this.model.get('selector'));
        this.listenTo(this.model, 'change:selector', this.update_selector);
    }

    update_selector(model, selector) {
        this.box = selector && document.querySelector(selector) || this.el;
        this.set_child(this.model.get('child'));
    }
}

export
class BoxView extends DOMWidgetView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.children_views = new ViewList(this.add_child_model, null, this);
        this.listenTo(this.model, 'change:children', function(model, value) {
            this.children_views.update(value);
        });
        this.listenTo(this.model, 'change:overflow_x', this.update_overflow_x);
        this.listenTo(this.model, 'change:overflow_y', this.update_overflow_y);
        this.listenTo(this.model, 'change:box_style', this.update_box_style);

        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-container');
        this.pWidget.addClass('widget-box');
    }

    static createPhosphorWidget() {
        return new Panel();
    }

    /**
     * Set a css attr of the widget view.
     */
    update_attr(name, value) { // TODO: Deprecated in 5.0
        this.pWidget.node.style[name] = value;
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.children_views.update(this.model.get('children'));
        this.update_overflow_x();
        this.update_overflow_y();
        this.update_box_style();
    }

    /**
     * Called when the x-axis overflow setting is changed.
     */
    update_overflow_x() {
        this.pWidget.node.style.overflowX = this.model.get('overflow_x');
    }

    /**
     * Called when the y-axis overflow setting is changed.
     */
    update_overflow_y() {
        this.pWidget.node.style.overflowY = this.model.get('overflow_y');
    }

    update_box_style() {
        var class_map = {
            success: ['alert', 'alert-success'],
            info: ['alert', 'alert-info'],
            warning: ['alert', 'alert-warning'],
            danger: ['alert', 'alert-danger']
        };
        this.update_mapped_classes(class_map, 'box_style');
    }

    /**
     * Called when a model is added to the children list.
     */
    add_child_model(model) {

        // we insert a dummy element so the order is preserved when we add
        // the rendered content later.
        var dummy = new Widget();
        this.pWidget.addChild(dummy);

        return this.create_child_view(model).then((view) => {
            // replace the dummy widget with the new one.
            let i = this.pWidget.childIndex(dummy);
            this.pWidget.insertChild(i, view.pWidget);
            dummy.dispose();

            // Trigger the displayed event of the child view.
            this.displayed.then(() => {
                view.trigger('displayed', this);
            });
            return view;
        }).catch(reject('Could not add child view to box', true));
    }

    remove() {
        // We remove this widget before removing the children as an optimization
        // we want to remove the entire container from the DOM first before
        // removing each individual child separately.
        super.remove()
        this.children_views.remove();
    }
    children_views: any;
    pWidget: Panel;
}

/**
 * Deprecated in 5.0 (entire model)
 */
export
class FlexBoxModel extends BoxModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'FlexBoxView',
            _model_name: 'FlexBoxModel',
            orientation: 'vertical',
            pack: 'start',
            align: 'start'
        })
    }
}

/**
 * Deprecated in 5.0 (entire view)
 */
export
class FlexBoxView extends BoxView {
    render() {
        super.render();
        this.listenTo(this.model, 'change:orientation', this.update_orientation);
        this.listenTo(this.model, 'change:flex', this._flex_changed);
        this.listenTo(this.model, 'change:pack', this._pack_changed);
        this.listenTo(this.model, 'change:align', this._align_changed);
        this._flex_changed();
        this._pack_changed();
        this._align_changed();
        this.update_orientation();
    }

    update_orientation() {
        var orientation = this.model.get('orientation');
        if (orientation == 'vertical') {
            this.pWidget.removeClass('hbox');
            this.pWidget.addClass('vbox');
        } else {
            this.pWidget.removeClass('vbox');
            this.pWidget.addClass('hbox');
        }
    }

    _flex_changed() {
        if (this.model.previous('flex')) {
            this.pWidget.removeClass('box-flex' + this.model.previous('flex'));
        }
        this.pWidget.addClass('box-flex' + this.model.get('flex'));
    }

    _pack_changed() {
        if (this.model.previous('pack')) {
            this.pWidget.removeClass(this.model.previous('pack'));
        }
        this.pWidget.addClass(this.model.get('pack'));
    }

    _align_changed() {
        if (this.model.previous('align')) {
            this.pWidget.removeClass('align-' + this.model.previous('align'));
        }
        this.pWidget.addClass('align-' + this.model.get('align'));
    }
}
