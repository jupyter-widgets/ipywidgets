// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetView } from '@jupyter-widgets/base';

import { CoreDOMWidgetModel } from './widget_core';

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
    return _.extend(super.defaults(), {
      _model_name: 'MappedImageModel',
      _view_name: 'MappedImageView',
      map_name: null,
      areas: null
    });
  }
}

export class MappedImageView extends ImageView {
  render(): void {
    /**
     * Called when view is rendered.
     */
    super.render();
    const mapEl = document.createElement('map');
    let map_name = this.model.get('map_name');
    if (map_name == null || map_name.length == 0) map_name = 'Map';
    mapEl.setAttribute('name', map_name);
    const areas = this.model.get('areas');
    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const areaEl = document.createElement('area');
      areaEl.setAttribute('name', area.name);
      areaEl.setAttribute('shape', area.shape);
      areaEl.setAttribute('coords', area.coords);
      if (area.href !== undefined && area.href.length > 0) {
        areaEl.setAttribute('href', area.href);
      }
      mapEl.appendChild(areaEl);
    }
    this.el.appendChild(mapEl);
    this.el.setAttribute('usemap', '#' + map_name);
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

    return super.update();
  }
}
