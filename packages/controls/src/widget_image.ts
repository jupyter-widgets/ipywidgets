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
            value: new DataView(new ArrayBuffer(0))
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        value: {serialize: (value, manager) => {
            return new DataView(value.buffer.slice(0));
        }}
    };
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

        let url;
        let format = this.model.get('format');
        let value = this.model.get('value');
        if (format !== 'url') {
            let blob = new Blob([value], {type: `image/${this.model.get('format')}`});
            url = URL.createObjectURL(blob);
        } else {
            url = (new TextDecoder('utf-8')).decode(value.buffer);
        }

        // Clean up the old objectURL
        let oldurl = this.el.src;
        this.el.src = url;
        if (oldurl && typeof oldurl !== 'string') {
            URL.revokeObjectURL(oldurl);
        }
        let width = this.model.get('width');
        if (width !== undefined && width.length > 0) {
            this.el.setAttribute('width', width);
        } else {
            this.el.removeAttribute('width');
        }

        let height = this.model.get('height');
        if (height !== undefined && height.length > 0) {
            this.el.setAttribute('height', height);
        } else {
            this.el.removeAttribute('height');
        }
        return super.update();
    }

    remove() {
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
    get tagName() {
        // We can't make this an attribute with a default value
        // since it would be set after it is needed in the
        // constructor.
        return 'img';
    }


    el: HTMLImageElement;
}
