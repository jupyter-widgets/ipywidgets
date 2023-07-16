// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDOMWidgetModel } from './widget_core';

import {
  DOMWidgetView,
  unpack_models,
  WidgetModel,
  WidgetView,
  JupyterLuminoPanelWidget,
  reject,
} from '@jupyter-widgets/base';

import $ from 'jquery';

export class DraggableBoxModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'DraggableBoxView',
      _model_name: 'DraggableBoxModel',
      child: null,
      draggable: true,
      drag_data: {},
    };
  }

  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    child: { deserialize: unpack_models },
  };
}

export class DropBoxModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'DropBoxView',
      _model_name: 'DropBoxModel',
      child: null,
    };
  }

  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    child: { deserialize: unpack_models },
  };
}

class DragDropBoxViewBase extends DOMWidgetView {
  child_view: DOMWidgetView | null;
  luminoWidget: JupyterLuminoPanelWidget;

  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoPanelWidget({ view: this });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }
    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.add_child_model(this.model.get('child'));
    this.listenTo(this.model, 'change:child', this.update_child);

    this.luminoWidget.addClass('jupyter-widgets');
    this.luminoWidget.addClass('widget-container');
    this.luminoWidget.addClass('widget-draggable-box');
  }

  add_child_model(model: WidgetModel): Promise<DOMWidgetView> {
    return this.create_child_view(model)
      .then((view: DOMWidgetView) => {
        if (this.child_view && this.child_view !== null) {
          this.child_view.remove();
        }
        this.luminoWidget.addWidget(view.luminoWidget);
        this.child_view = view;
        return view;
      })
      .catch(reject('Could not add child view to box', true));
  }

  update_child(): void {
    this.add_child_model(this.model.get('child'));
  }

  remove(): void {
    this.child_view = null;
    super.remove();
  }
}

const JUPYTER_VIEW_MIME = 'application/vnd.jupyter.widget-view+json';

export class DraggableBoxView extends DragDropBoxViewBase {
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.dragSetup();
  }

  events(): { [e: string]: string } {
    return { dragstart: 'on_dragstart' };
  }

  on_dragstart(event: DragEvent): void {
    if (event.dataTransfer) {
      if (this.model.get('child').get('value')) {
        event.dataTransfer?.setData(
          'text/plain',
          this.model.get('child').get('value')
        );
      }
      const drag_data = this.model.get('drag_data');
      for (const datatype in drag_data) {
        event.dataTransfer.setData(datatype, drag_data[datatype]);
      }
      event.dataTransfer.setData(
        JUPYTER_VIEW_MIME,
        JSON.stringify({
          model_id: this.model.model_id,
          version_major: 2,
          version_minor: 0,
        })
      );
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  dragSetup(): void {
    this.el.draggable = this.model.get('draggable');
    this.model.on('change:draggable', this.on_change_draggable, this);
  }

  on_change_draggable(): void {
    this.el.draggable = this.model.get('draggable');
  }
}

export class DropBoxView extends DragDropBoxViewBase {
  events(): { [e: string]: string } {
    return {
      drop: '_handle_drop',
      dragover: 'on_dragover',
    };
  }

  _handle_drop(event: DragEvent): void {
    event.preventDefault();

    const datamap: { [e: string]: string } = {};

    if (event.dataTransfer) {
      for (let i = 0; i < event.dataTransfer.types.length; i++) {
        const t = event.dataTransfer.types[i];
        datamap[t] = event.dataTransfer?.getData(t);
      }
    }

    this.send({ event: 'drop', data: datamap });
  }

  on_dragover(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }
}
