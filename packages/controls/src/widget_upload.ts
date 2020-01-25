// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDOMWidgetModel } from './widget_core';
import { DOMWidgetView } from '@jupyter-widgets/base';

interface IFileUploaded {
  content: ArrayBuffer;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  error: string;
}

export class FileUploadModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'FileUploadModel',
      _view_name: 'FileUploadView',
      accept: '',
      description: 'Upload',
      disabled: false,
      icon: 'upload',
      button_style: '',
      multiple: false,
      value: [], // has type Array<IFileUploaded>
      error: '',
      style: null
    };
  }

  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    // use a dummy serializer for value to circumvent the default serializer.
    value: { serialize: <T>(x: T): T => x }
  };
}

export class FileUploadView extends DOMWidgetView {
  el: HTMLButtonElement;
  fileInput: HTMLInputElement;

  get tagName(): string {
    return 'button';
  }

  render(): void {
    super.render();

    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-upload');
    this.el.classList.add('jupyter-button');

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';

    this.el.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('click', () => {
      this.fileInput.value = '';
    });

    this.fileInput.addEventListener('change', () => {
      const promisesFile: Array<Promise<IFileUploaded>> = [];

      Array.from(this.fileInput.files ?? []).forEach((file: File) => {
        promisesFile.push(
          new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (): void => {
              // We know we can read the result as an array buffer since
              // we use the `.readAsArrayBuffer` method
              const content: ArrayBuffer = fileReader.result as ArrayBuffer;
              resolve({
                content,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                error: ''
              });
            };
            fileReader.onerror = (): void => {
              reject();
            };
            fileReader.onabort = fileReader.onerror;
            fileReader.readAsArrayBuffer(file);
          })
        );
      });

      Promise.all(promisesFile)
        .then((files: Array<IFileUploaded>) => {
          this.model.set({
            value: files,
            error: ''
          });
          this.touch();
        })
        .catch(err => {
          console.error('error in file upload: %o', err);
          this.model.set({
            error: err
          });
          this.touch();
        });
    });

    this.listenTo(this.model, 'change:button_style', this.update_button_style);
    this.set_button_style();
    this.update(); // Set defaults.
  }

  update(): void {
    this.el.disabled = this.model.get('disabled');
    this.el.setAttribute('title', this.model.get('tooltip'));

    const value: [] = this.model.get('value');
    const description = `${this.model.get('description')} (${value.length})`;
    const icon = this.model.get('icon');

    if (description.length || icon.length) {
      this.el.textContent = '';
      if (icon.length) {
        const i = document.createElement('i');
        i.classList.add('fa');
        i.classList.add('fa-' + icon);
        if (description.length === 0) {
          i.classList.add('center');
        }
        this.el.appendChild(i);
      }
      this.el.appendChild(document.createTextNode(description));
    }

    this.fileInput.accept = this.model.get('accept');
    this.fileInput.multiple = this.model.get('multiple');

    return super.update();
  }

  update_button_style(): void {
    this.update_mapped_classes(
      FileUploadView.class_map,
      'button_style',
      this.el
    );
  }

  set_button_style(): void {
    this.set_mapped_classes(FileUploadView.class_map, 'button_style', this.el);
  }

  static class_map = {
    primary: ['mod-primary'],
    success: ['mod-success'],
    info: ['mod-info'],
    warning: ['mod-warning'],
    danger: ['mod-danger']
  };
}
