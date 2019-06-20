// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as pako from 'pako';

import { CoreDOMWidgetModel } from './widget_core';
import { ButtonStyleModel } from './widget_button';
import { DOMWidgetView } from '@jupyter-widgets/base';

import * as _ from 'underscore';

export class FileUploadModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FileUploadModel',
            _view_name: 'FileUploadView',

            _counter: 0,
            accept: '',
            description: 'Upload',
            tooltip: '',
            disabled: false,
            icon: 'upload',
            button_style: '',
            multiple: false,
            li_metadata: [],
            li_content: [],
            error: '',
            style: null
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        li_content: { serialize: buffers => { return [...buffers]; } },
    };
}

export class FileUploadView extends DOMWidgetView {

    el: HTMLDivElement;
    btn: HTMLButtonElement;
    fileInput: HTMLInputElement;
    fileReader: FileReader;

    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-upload');

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.style.display = 'none';
        this.el.appendChild(this.fileInput);

        this.btn = document.createElement('button');
        this.btn.classList.add('jupyter-button');
        this.el.appendChild(this.btn);

        this.btn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('click', () => {
            this.fileInput.value = '';
        });

        this.fileInput.addEventListener('change', () => {

            const promisesFile = [];

            Array.from(this.fileInput.files).forEach(file => {
                promisesFile.push(
                    new Promise((resolve, reject) => {
                        const metadata = {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            lastModified: file.lastModified,
                        };
                        this.fileReader = new FileReader();
                        this.fileReader.onload = event => {
                            const buffer = (event as any).target.result;
                            resolve({
                                buffer,
                                metadata,
                                error: '',
                            });
                        };
                        this.fileReader.onerror = () => {
                            reject();
                        };
                        this.fileReader.onabort = this.fileReader.onerror;
                        this.fileReader.readAsArrayBuffer(file);
                    })
                );
            });

            Promise.all(promisesFile)
                .then(contents => {
                    const li_metadata = [];
                    const li_buffer = [];
                    contents.forEach(c => {
                        li_metadata.push(c.metadata);
                        li_buffer.push(c.buffer);
                    });
                    let counter = this.model.get('_counter');
                    this.model.set({
                        _counter: counter + contents.length,
                        li_metadata,
                        li_content: li_buffer,
                        error: '',
                    });
                    this.touch();
                })
                .catch(err => {
                    console.error('error in file upload: %o', err);
                    this.model.set({
                        error: err,
                    });
                    this.touch();
                });
        });

        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    }

    update() {
        this.btn.disabled = this.model.get('disabled');
        this.btn.setAttribute('title', this.model.get('tooltip'));

        let model_description = this.model.get('description');
        let description = `${this.model.get('description')} (${this.model.get('_counter')})`
        let icon = this.model.get('icon');
        if (description.length || icon.length) {
            this.btn.textContent = '';
            if (icon.length) {
                let i = document.createElement('i');
                i.classList.add('fa');
                i.classList.add('fa-' + icon);
                if (description.length === 0) {
                    i.classList.add('center');
                }
                this.btn.appendChild(i);
            }
            this.btn.appendChild(document.createTextNode(description));
        }

        this.fileInput.accept = this.model.get('accept');
        this.fileInput.multiple = this.model.get('multiple');

        return super.update();
    }

    update_button_style() {
        this.update_mapped_classes(FileUploadView.class_map, 'button_style', this.btn);
    }

    set_button_style() {
        this.set_mapped_classes(FileUploadView.class_map, 'button_style', this.btn);
    }

    static class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
}
