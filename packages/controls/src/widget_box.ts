// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView, unpack_models, ViewList, JupyterPhosphorWidget
} from '@jupyter-widgets/base';

import {
    CoreDOMWidgetModel
} from './widget_core';

import {
    reject
} from './utils';

import {
    ArrayExt
} from '@phosphor/algorithm';

import {
    MessageLoop, Message
} from '@phosphor/messaging';

import {
    Widget, Panel
} from '@phosphor/widgets';

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
class BoxModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'BoxView',
            _model_name: 'BoxModel',
            children: [],
            box_style: ''
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        children: {deserialize: unpack_models}
    };
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
        this.listenTo(this.model, 'change:children', this.update_children);
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
        this.update_children();
        this.set_box_style();
    }

    update_children() {
        this.children_views.update(this.model.get('children')).then((views: DOMWidgetView[]) => {
                // Notify all children that their sizes may have changed.
                views.forEach( (view) => {
                    MessageLoop.postMessage(view.pWidget, Widget.ResizeMessage.UnknownSize);
                });
        });
    }
    update_box_style() {
        this.update_mapped_classes(BoxView.class_map, 'box_style');
    }

    set_box_style() {
        this.set_mapped_classes(BoxView.class_map, 'box_style');
    }

    add_child_model(model) {
        // we insert a dummy element so the order is preserved when we add
        // the rendered content later.
        let dummy = new Widget();
        this.pWidget.addWidget(dummy);

        return this.create_child_view(model).then((view: DOMWidgetView) => {
            // replace the dummy widget with the new one.
            let i = ArrayExt.firstIndexOf(this.pWidget.widgets, dummy);
            this.pWidget.insertWidget(i, view.pWidget);
            dummy.dispose();
            return view;
        }).catch(reject('Could not add child view to box', true));
    }

    remove() {
        this.children_views = null;
        super.remove();
    }

    children_views: ViewList<DOMWidgetView>;
    pWidget: JupyterPhosphorPanelWidget;

    static class_map = {
        success: ['alert', 'alert-success'],
        info: ['alert', 'alert-info'],
        warning: ['alert', 'alert-warning'],
        danger: ['alert', 'alert-danger']
    };
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

export
class GridBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.pWidget.addClass('widget-gridbox');
        // display needn't be set to flex and grid 
        this.pWidget.removeClass('widget-box');
    }
}

export
class GridBoxModel extends BoxModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'GridBoxView',
            _model_name: 'GridBoxModel',
        });
    }
}
