import { DummyManager } from './dummy-manager';

import { expect } from 'chai';

import * as widgets from '../../lib';

function getFileInput(view: widgets.FileUploadView): HTMLInputElement {
  const elem = view.fileInput;
  return elem as HTMLInputElement;
}

function getProxyButton(view: widgets.FileUploadView): HTMLButtonElement {
  const elem = view.el;
  return elem as HTMLButtonElement;
}

describe.only('FileUploadView', function() {
  beforeEach(async function() {
    this.manager = new DummyManager();
    const modelId = 'u-u-i-d';
    this.model = await this.manager.new_model(
      {
        model_name: 'FileUploadModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '1.0.0',
        model_id: modelId
      },
      {}
    );
  });

  function fileInputForModel(model: widgets.FileUploadModel) {
    // For a given model, create and render a view and return the
    // view's input.
    const options = { model };
    const view = new widgets.FileUploadView(options);
    view.render();
    return getFileInput(view);
  }

  function proxyButtonForModel(model: widgets.FileUploadModel) {
    const options = { model };
    const view = new widgets.FileUploadView(options);
    view.render();
    return getProxyButton(view);
  }

  it('construction', function() {
    const options = { model: this.model };
    const view = new widgets.FileUploadView(options);
    expect(view).to.not.be.undefined;
  });

  it('default options', function() {
    const options = { model: this.model };
    const view = new widgets.FileUploadView(options);
    view.render();
    const fileInput = getFileInput(view);
    const proxyButton = getProxyButton(view);
    expect(fileInput.disabled).to.be.false;
    expect(fileInput.multiple).to.be.false;
    expect(proxyButton.innerText).to.equal('Upload (0)');
    expect(proxyButton.querySelector('i')).to.not.be.null;
    expect(proxyButton.querySelector('i')!.className).to.equal('fa fa-upload');
  });

  it('multiple', function() {
    this.model.set('multiple', true);
    const fileInput = fileInputForModel(this.model);
    expect(fileInput.multiple).to.be.true;
  });

  it('accept', function() {
    this.model.set('accept', 'text/csv');
    const fileInput = fileInputForModel(this.model);
    expect(fileInput.accept).to.equal('text/csv');
  });

  it('disabled', function() {
    this.model.set('disabled', true);
    const proxyButton = proxyButtonForModel(this.model);
    expect(proxyButton.disabled).to.be.true;
  });

  it('no icon', function() {
    this.model.set('icon', '');
    const proxyButton = proxyButtonForModel(this.model);
    expect(proxyButton.querySelector('i')).to.be.null;
  });

  it('other icon', function() {
    this.model.set('icon', 'check');
    const proxyButton = proxyButtonForModel(this.model);
    expect(proxyButton.querySelector('i')).to.not.be.null;
    expect(proxyButton.querySelector('i')!.className).to.equal('fa fa-check');
  });

  it('description', function() {
    this.model.set('description', 'some text');
    const proxyButton = proxyButtonForModel(this.model);
    expect(proxyButton.innerText).to.equal('some text (0)');
  });
});
