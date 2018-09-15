// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    DescriptionView
} from './widget_description';

import * as _ from 'underscore';

export
class UploadModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'UploadModel',
            _view_name: 'UploadView',
            _values_base64: [],
            accept: '',
            multiple: false
        });
    }
}

export
class UploadView extends DescriptionView {
    render() {
        /**
         * Called when view is rendered.
         */
        super.render();
        this.pWidget.addClass('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.pWidget.addClass('widget-upload');

        this.loader = document.createElement('div');
        this.loader.classList.add('widget-upload-loader');
        this.el.appendChild(this.loader);

        this.upload_container = document.createElement('input');
        this.upload_container.setAttribute('type', 'file');
        this.handleUploadChanged = this.handleUploadChanged.bind(this);
        this.upload_container.onchange = this.handleUploadChanged;

        this.el.appendChild(this.upload_container);

        this.listenTo(this.model, 'change:_metadata', this._metadata_updated);
        this._metadata_updated();
        this.update(); // Set defaults.
    }

    _metadata_updated() {
        // Only allow for value to clear. This is a rule enforced by browsers
        const metadata = this.model.get('_metadata');
        if (metadata.length === 0) {
            this.upload_container.value = '';
        }
    }

    update(options?) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view !== this) {
            this.upload_container.disabled = this.model.get('disabled');
            this.upload_container.setAttribute('accept', this.model.get('accept'));
            if (this.model.get('multiple')) {
                this.upload_container.setAttribute('multiple', 'true');
            } else {
                this.upload_container.removeAttribute('multiple');
            }
            this.loader.style.visibility = this.model.get('loading') ? 'visible' : 'hidden';
        }
        return super.update(options);
    }

    handleUploadChanged(event) {
        const that = this;
        const {files} = event.target;
        // Clear data
        that.model.set('_values_base64', []);
        if (!files || files.length === 0) {
            that.model.set('_metadata', []);
            that.touch();
            return;
        }

        this.model.set('loading', true);
        const fileContentsPromises = [];
        const metadataList = [];
        const updateMetadata = () => {
            that.model.set('_metadata', _.map(metadataList, _.clone));
            that.touch();
        };
        for (let file of files) { // files it NOT an array
            fileContentsPromises.push(new Promise((resolve, reject) => {
                const metadata = {
                    name: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    error: undefined,
                };
                metadataList.push(metadata);
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
                fileReader.onerror = () => {
                    metadata.error = fileReader.error.message;
                    updateMetadata();
                    resolve(); // Done, but no data
                };
                fileReader.onabort = fileReader.onerror;
                // Using onprogress has issues as we do not know when that data is synced to jupyter
                fileReader.readAsDataURL(file);
            }));
        }
        updateMetadata();
        Promise.all(fileContentsPromises)
            .then((contents) => {
                that.model.set('_values_base64', contents);
                that.touch();
            })
            .catch((err) => {
                // We do not use reject above, so no need to come up with a UI yet
                console.error('FileUploadView Error loading files: %o', err);
            });
    }

    upload_container: HTMLInputElement;
    loader: HTMLDivElement;
    model: UploadModel;
}
