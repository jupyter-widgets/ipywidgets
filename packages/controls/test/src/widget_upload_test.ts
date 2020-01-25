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
    expect(proxyButton.querySelector('i')).to.not.be.undefined;
    expect(proxyButton.querySelector('i')!.className).to.equal('fa fa-upload');
  });

  it('multiple', function() {
    const options = { model: this.model };
    this.model.set('multiple', true);
    const view = new widgets.FileUploadView(options);
    view.render();
    const fileInput = getFileInput(view);
    expect(fileInput.multiple).to.be.true;
  });
});
