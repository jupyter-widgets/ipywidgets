// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView
} from '@jupyter-widgets/base';

import {
    CoreDOMWidgetModel
} from './widget_core';

import * as _ from 'underscore';

export
class ImageModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ImageModel',
            _view_name: 'ImageView',
            format: 'png',
            width: '',
            height: '',
            value: new Uint8Array(0),
            natural_height: 0,
            natural_width: 0
        });
    }
}

export
class ImageView extends DOMWidgetView {
    render() {
        /**
         * Called when view is rendered.
         */
        super.render();
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-image');
        this.update(); // Set defaults.
    }

    update() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var blob = new Blob([this.model.get('value')], {type: `image/${this.model.get('format')}`});
        var url = URL.createObjectURL(blob);
        var oldurl = this.el.src;
        this.el.src = url;
        if (oldurl) {
            URL.revokeObjectURL(oldurl);
        }
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

        super.update();


    }

    remove() {
        if (this.el.src) {
            URL.revokeObjectURL(this.el.src);
        }
        super.remove()
    }

    /**
     * The default tag name.
     *
     * #### Notes
     * This is a read-only attribute.
     */
    get tagName() {
        // We can't make this an attribute with a default value
        // since it would be set after it is needed in the
        // constructor.
        return 'img';
    }


    el: HTMLImageElement;

    /**
     * Given the location of a click event relative to the upper left corner
     * of the image area, calculate location in original image.
     */
    _click_location_original_image(event) {
        var pad_left = parseInt(this.el.style.paddingLeft) || 0;
        var border_left = parseInt(this.el.style.borderLeft) || 0;
        var pad_top = parseInt(this.el.style.paddingTop) || 0;
        var border_top = parseInt(this.el.style.borderTop) || 0;

        var relative_click_x = parseInt(event.relativeX) - border_left - pad_left;
        var relative_click_y = parseInt(event.relativeY) - border_top - pad_top;
        var image_x = Math.round(relative_click_x / this.el.width * this.el.naturalWidth);
        var image_y = Math.round(relative_click_y / this.el.height * this.el.naturalHeight);
        return {x: image_x, y: image_y}
    }

    _handle_load(event) {;
        this.model.set('natural_height', this.el.naturalHeight, {updated_view: this});
        this.model.set('natural_width', this.el.naturalWidth, {updated_view: this});
        this.touch();
    }

    _array_xy(event) {
        return this._click_location_original_image(event)
    }

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'load': '_handle_load',
        }
    }
}
