// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDOMWidgetModel
} from './widget_core';

import {
    DOMWidgetView, unpack_models, WidgetModel, WidgetView, JupyterLuminoPanelWidget, reject
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

export
class DraggableBoxModel extends CoreDOMWidgetModel {
    defaults(): Backbone.ObjectHash {
        return _.extend(super.defaults(), {
            _view_name: 'DraggableBoxView',
            _model_name: 'DraggableBoxModel',
            child: null,
            draggable: true,
            drag_data: {}
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        child: {deserialize: unpack_models}
    };
}

export
class DropBoxModel extends CoreDOMWidgetModel {
    defaults(): Backbone.ObjectHash {
        return _.extend(super.defaults(), {
            _view_name: 'DropBoxView',
            _model_name: 'DropBoxModel',
            child: null
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        child: {deserialize: unpack_models}
    };
}

class DragDropBoxViewBase extends DOMWidgetView {
    child_view: DOMWidgetView | null;
    pWidget: JupyterLuminoPanelWidget;

    _createElement(tagName: string): HTMLElement {
        this.pWidget = new JupyterLuminoPanelWidget({ view: this });
        return this.pWidget.node;
    }

    _setElement(el: HTMLElement): void {
        if (this.el || el !== this.pWidget.node) {
            // Boxes don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }

        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
    }

    initialize(parameters: WidgetView.IInitializeParameters): void {
        super.initialize(parameters);
        this.add_child_model(this.model.get('child'));
        this.listenTo(this.model, 'change:child', this.update_child);

        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-container');
        this.pWidget.addClass('widget-draggable-box');
    }

    add_child_model(model: WidgetModel): Promise<DOMWidgetView> {
        return this.create_child_view(model).then((view: DOMWidgetView) => {
            if (this.child_view && this.child_view !== null) {
                this.child_view.remove();
            }
            this.pWidget.addWidget(view.pWidget);
            this.child_view = view;
            return view;
        }).catch(reject('Could not add child view to box', true));
    }

    update_child(): void {
        this.add_child_model(this.model.get('child'));
    }

    render(): void {
        super.render();
    }

    remove(): void {
        this.child_view = null;
        super.remove();
    }
}

export
class DraggableBoxView extends DragDropBoxViewBase {
    /** 
     * Draggable mixin.
     * Allows the widget to be draggable
     *
     * Note: In order to use it, you will need to add
     * handlers for dragstartevent in the view class
     * also need to call dragSetup at initialization time
     *
     * The view class must implement Draggable interface and
     * declare the methods (no definition).
     * For example:
     *
     * on_dragstart : (event: Object) => void;
     * on_change_draggable : () => void;
     * dragSetup : () => void;
     *
     * Also need to call applyMixin on the view class
     * The model class needs to have drag_data attribute
     *
     * follows the example from typescript docs
     * https://www.typescriptlang.org/docs/handbook/mixins.html
     */

    initialize(parameters: WidgetView.IInitializeParameters): void {
        super.initialize(parameters);
        this.dragSetup();
    }

    events(): {[e: string] : string; } {
        return {'dragstart' : 'on_dragstart'};
    }

    on_dragstart(event: any) {
        if (this.model.get('child')?.get('value')) {
            event.dataTransfer.setData('text/plain', this.model.get('child').get('value'));
        }
        let drag_data = this.model.get('drag_data');
        for (let datatype in drag_data) {
          event.dataTransfer.setData(datatype, drag_data[datatype]);
        }

        event.dataTransfer.setData('application/vnd.jupyter.widget-view+json', this.model.model_id);
        event.dataTransfer.dropEffect = 'copy';
    }

    dragSetup() {
        this.el.draggable = this.model.get('draggable');
        this.model.on('change:draggable', this.on_change_draggable, this);
    }

    on_change_draggable() {
      this.el.draggable = this.model.get('draggable');
    }
}

export
class DropBoxView extends DragDropBoxViewBase {
    /** Droppbable mixin
     * Implements handler for drop events.
     * The view class implementing this interface needs to
     * listen to 'drop' event with '_handle_drop', and to
     * 'dragover' event with 'on_dragover'
     *
     * In order to use this mixin, the view class needs to
     * implement the Droppable interface, define the following
     * placeholders:
     *
     *  _handle_drop : (event: Object) => void;
     * on_dragover : (event : Object) => void;
     *
     * and you need to call applyMixin on class definition.
     *
     * follows the example from typescript docs
     * https://www.typescriptlang.org/docs/handbook/mixins.html
     */

    events(): {[e: string] : string; } {
        return {
            'drop': '_handle_drop',
            'dragover': 'on_dragover'
        };
    }

    _handle_drop(event: any) {
        event.preventDefault();

        let datamap: any = {};

        for (let i=0; i < event.dataTransfer.types.length; i++) {
          let t = event.dataTransfer.types[i];
          datamap[t] = event.dataTransfer.getData(t);
        }

        this.send({event: 'drop', data: datamap});
    }

    on_dragover(event: any) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    }
}