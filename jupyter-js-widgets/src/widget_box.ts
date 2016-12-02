// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, unpack_models, ViewList, JupyterPhosphorWidget
} from './widget';

import {
    reject
} from './utils';

import {
    indexOf
} from 'phosphor/lib/algorithm/searching';

import {
    Message
} from 'phosphor/lib/core/messaging';

import {
    Panel
} from 'phosphor/lib/ui/panel';

import {
    Widget
} from 'phosphor/lib/ui/widget';

import * as _ from 'underscore';
import * as $ from 'jquery';

export
class JupyterPhosphorPanelWidget extends Panel {
    constructor(options: JupyterPhosphorWidget.IOptions & Panel.IOptions) {
        let view = options.view;
        delete options.view;
        super(options);
        this._view = view;
    }

    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    processMessage(msg: Message) {
        super.processMessage(msg);
        this._view.processPhosphorMessage(msg);
    }

    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    }

    private _view: DOMWidgetView;
}


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
class HBoxModel extends BoxModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'HBoxView',
            _model_name: 'HBoxModel',
        });
    }
}

export
class VBoxModel extends BoxModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'VBoxView',
            _model_name: 'VBoxModel',
        });
    }
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

    _createElement(tagName: string) {
        this.pWidget = new JupyterPhosphorPanelWidget({ view: this });
        return this.pWidget.node;
    }

    _setElement(el: HTMLElement) {
        if (this.el || el !== this.pWidget.node) {
            // Boxes don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }

        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
     }

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

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
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
        this.pWidget.addWidget(dummy);

        return this.create_child_view(model).then((view: DOMWidgetView) => {
            // replace the dummy widget with the new one.
            let i = indexOf(this.pWidget.widgets, dummy);
            this.pWidget.insertWidget(i, view.pWidget);
            dummy.dispose();
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
    pWidget: JupyterPhosphorPanelWidget;
}

export
class HBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.pWidget.addClass('widget-hbox');
    }
}

export
class VBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.pWidget.addClass('widget-vbox');
    }
}
