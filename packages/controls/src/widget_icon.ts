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
class IconModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'IconModel',
            _view_name: 'IconView',
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
class IconView extends DOMWidgetView {
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

        let format = this.model.get('format');
        let value = this.model.get('value');
        if(this.img) {
            this.el.removeChild(this.img)
            if (this.img.src) {
                URL.revokeObjectURL(this.img.src);
            }
            this.img = null;
        }
        // remove the fontawesome classes
        Array.prototype.slice.call(this.el.classList).forEach((name) => {
            if(name === 'fa' || name.startsWith('fa-'))
                this.el.classList.remove(name)
        });
        if (format === 'fontawesome') {
            let iconName = (new TextDecoder('utf-8')).decode(value.buffer);
            this.el.classList.add('fa');
            this.el.classList.add('fa-' + iconName);
        } else {

            let url;
            if (format !== 'url') {
                let blob = new Blob([value], {type: `image/${this.model.get('format')}`});
                url = URL.createObjectURL(blob);
            } else {
                url = (new TextDecoder('utf-8')).decode(value.buffer);
            }

            this.img = document.createElement('img');
            this.img.src = url;
            // Clean up the old objectURL
            // let oldurl = this.el.src;
            // this.el.src = url;
            // if (oldurl && typeof oldurl !== 'string') {
            //     URL.revokeObjectURL(oldurl);
            // }
            let width = this.model.get('width');
            if (width !== undefined && width.length > 0) {
                this.img.setAttribute('width', width);
            } else {
                this.img.removeAttribute('width');
            }

            let height = this.model.get('height');
            if (height !== undefined && height.length > 0) {
                this.img.setAttribute('height', height);
            } else {
                this.img.removeAttribute('height');
            }
            this.el.appendChild(this.img);
            }
        return super.update();
    }

    remove() {
        if (this.img && this.img.src) {
            URL.revokeObjectURL(this.img.src);
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
        return 'span';
    }

    el: HTMLElement;
    img: HTMLImageElement;
}
