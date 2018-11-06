// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as pako from 'pako';

import { CoreDOMWidgetModel } from './widget_core';
import { DOMWidgetView } from '@jupyter-widgets/base';

import * as _ from 'underscore';

function serialize_content(listBuffer) {
    return listBuffer.map(e => new DataView(e.slice(0)));
}

function build_btn_inner_html(n) {
    const icon = `<i class="fa fa-upload"></i>`;
    const text = `Upload`;
    let html = `${icon}  ${text}`;
    if (n === 1) {
        html += ` (${n} file)`;
    }

    if (n > 1) {
        html += ` (${n} files)`;
    }
    return html;
}

export class FileUploadModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FileUploadModel',
            _view_name: 'FileUploadView',

            _counter: 0,
            accept: '',
            disabled: false,
            multiple: false,
            style: '',
            compress_level: 0,
            li_metadata: [],
            li_content: [],
            error: '',
        });
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        li_content: { serialize: serialize_content },
    };
}

export class FileUploadView extends DOMWidgetView {
    fileInput: any;
    fileReader: any;
    btn: any;

    render() {
        super.render();
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-upload');

        const that = this;
        let counter;

        const divLoader = document.createElement('div');
        this.el.appendChild(divLoader);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = this.model.get('multiple');
        fileInput.setAttribute('style', 'display: none');
        divLoader.appendChild(fileInput);
        this.fileInput = fileInput;

        const btn = document.createElement('button');
        btn.innerHTML = build_btn_inner_html(null);
        btn.className = 'p-Widget jupyter-widgets jupyter-button widget-button';
        btn.disabled = this.model.get('disabled');
        btn.setAttribute('style', this.model.get('style_button'));
        divLoader.appendChild(btn);
        this.btn = btn;

        btn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });

        fileInput.addEventListener('change', () => {
            // console.log(`new input: nb files = ${fileInput.files.length}`);
            const promisesFile = [];
            Array.from(fileInput.files).forEach(file => {
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
                            const buffer = event.target.result;
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
                        const compress_level = this.model.get('compress_level');
                        if (compress_level > 0) {
                            const compressed = pako.deflate(c.buffer, {
                                level: compress_level,
                            });
                            li_buffer.push(compressed.buffer);
                        } else {
                            li_buffer.push(c.buffer);
                        }
                    });
                    counter = this.model.get('_counter');
                    that.model.set({
                        _counter: counter + 1,
                        li_metadata,
                        li_content: li_buffer,
                        error: '',
                    });
                    that.touch();
                    btn.innerHTML = build_btn_inner_html(li_metadata.length);
                })
                .catch(err => {
                    console.error('error in file upload: %o', err);
                    counter = this.model.get('_counter');
                    that.model.set({
                        _counter: counter + 1,
                        error: err,
                    });
                    that.touch();
                    btn.innerHTML = build_btn_inner_html(null);
                });
        });

        that.model.on('change:accept', that.update_accept, that);
        that.model.on('change:disabled', that.toggle_disabled, that);
        that.model.on('change:multiple', that.update_multiple, that);
        that.model.on('change:style_button', that.update_style_button, that);
    }

    update_accept() {
        this.fileInput.accept = this.model.get('accept');
    }
    toggle_disabled() {
        this.btn.disabled = this.model.get('disabled');
    }
    update_multiple() {
        this.fileInput.multiple = this.model.get('multiple');
    }
    update_style_button() {
        this.btn.setAttribute('style', this.model.get('style_button'));
    }

    el: HTMLImageElement;
}
