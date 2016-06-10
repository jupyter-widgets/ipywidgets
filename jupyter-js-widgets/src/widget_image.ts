// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView
} from './widget';

import {
    Widget
} from 'phosphor-widget';

import * as _ from 'underscore';

export
class ImageModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ImageModel',
            _view_name: 'ImageView',
            format: 'png',
            width: '',
            height: '',
            _b64value: ''
        });
    }
}

export
class ImagePWidget extends Widget {
    static createNode(): HTMLImageElement {
        return document.createElement('img');
    }
}

export
class ImageView extends DOMWidgetView {
    static createPhosphorWidget(): ImagePWidget {
        return new ImagePWidget();
    }

    render() {
        /**
         * Called when view is rendered.
         */
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
        var image_src = 'data:image/' + this.model.get('format') + ';base64,' + this.model.get('_b64value');
        this.el.setAttribute('src', image_src);

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
        return super.update();
    }
    
    el: HTMLImageElement;
}
