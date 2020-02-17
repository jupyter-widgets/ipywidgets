// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetView, unpack_models } from '@jupyter-widgets/base';

import { CoreDOMWidgetModel } from './widget_core';

import { uuid } from './utils';

export class ImageModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ImageModel',
      _view_name: 'ImageView',
      format: 'png',
      width: '',
      height: '',
      value: new DataView(new ArrayBuffer(0))
    };
  }

  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    value: {
      serialize: (value: any): DataView => {
        return new DataView(value.buffer.slice(0));
      }
    }
  };
}

export class ImageView extends DOMWidgetView {
  render(): void {
    /**
     * Called when view is rendered.
     */
    super.render();
    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-image');
    this.update(); // Set defaults.
  }

  update(): void {
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */

    let url;
    const format = this.model.get('format');
    const value = this.model.get('value');
    if (format !== 'url') {
      const blob = new Blob([value], {
        type: `image/${this.model.get('format')}`
      });
      url = URL.createObjectURL(blob);
    } else {
      url = new TextDecoder('utf-8').decode(value.buffer);
    }

    // Clean up the old objectURL
    const oldurl = this.el.src;
    this.el.src = url;
    if (oldurl && typeof oldurl !== 'string') {
      URL.revokeObjectURL(oldurl);
    }
    const width = this.model.get('width');
    if (width !== undefined && width.length > 0) {
      this.el.setAttribute('width', width);
    } else {
      this.el.removeAttribute('width');
    }

    const height = this.model.get('height');
    if (height !== undefined && height.length > 0) {
      this.el.setAttribute('height', height);
    } else {
      this.el.removeAttribute('height');
    }
    return super.update();
  }

  remove(): void {
    if (this.el.src) {
      URL.revokeObjectURL(this.el.src);
    }
    super.remove();
  }

  /**
   * Dictionary of events and handlers
   */
  events(): { [e: string]: string } {
    return { click: '_handle_click' };
  }

  /**
   * Handles when the image is clicked.
   */
  _handle_click(event: MouseEvent): void {
    event.preventDefault();
    const relative_xy = this._get_relative_xy(event);
    this.send({ event: 'click', click_pos: JSON.stringify(relative_xy) });
  }

  /**
   * The default tag name.
   *
   * #### Notes
   * This is a read-only attribute.
   */
  get tagName(): string {
    // We can't make this an attribute with a default value
    // since it would be set after it is needed in the
    // constructor.
    return 'img';
  }

  el: HTMLImageElement;
}

export class MappedImageModel extends ImageModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'MappedImageModel',
      _view_name: 'MappedImageView',
      areas: null
    };
  }

  static serializers = {
    ...ImageModel.serializers,
    areas: { deserialize: unpack_models }
  };
}

export class MappedImageView extends ImageView {
  render(): void {
    /**
     * Called when view is rendered.
     */
    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-mapped-image');
    const map_name = uuid();
    this.el.setAttribute('usemap', '#' + map_name);
    this.map = document.createElement('map');
    this.map.setAttribute('name', map_name);
    this.el.appendChild(this.map);
    this.update(); // Set defaults.
  }

  update(): void {
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    super.update(); // Render image
    const areas = this.model.get('areas');
    for (let i = 0; i < areas.length; i++) {
      const area = document.createElement('area');
      this.map.appendChild(area);
      area.outerHTML = areas[i].get('value');
    }
  }

  /**
   * Handles when the image is clicked.
   * Let the browser do it!
   */
  _handle_click(event: MouseEvent): void {
    return;
  }

  map: HTMLMapElement;
}
