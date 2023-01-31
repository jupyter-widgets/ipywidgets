import { DummyManager } from './dummy-manager';

import { expect } from 'chai';

import * as widgets from '../../lib';

describe('ComboboxView', function () {
  beforeEach(async function () {
    this.manager = new DummyManager();
    const modelId = 'u-u-i-d';
    this.model = await this.manager.new_model(
      {
        model_name: 'ComboboxModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '1.0.0',
        model_id: modelId,
      },
      { description: 'test-combo-model' }
    );
  });

  it('construction', function () {
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    expect(view).to.not.be.undefined;
  });

  it('no invalid flag when not checking', function () {
    this.model.set({
      value: 'ABC',
      options: ['ABCDEF', '123', 'foobar'],
      ensure_option: false,
    });
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    view.render();
    expect(
      view.textbox.classList.contains('jpwidgets-invalidComboValue')
    ).to.equal(false);
  });

  it('no invalid flag with valid value', function () {
    this.model.set({
      value: 'ABCDEF',
      options: ['ABCDEF', '123', 'foobar'],
      ensure_option: true,
    });
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    view.render();
    expect(
      view.textbox.classList.contains('jpwidgets-invalidComboValue')
    ).to.equal(false);
  });

  it('sets invalid flag when it should', function () {
    this.model.set({
      value: 'ABC',
      options: ['ABCDEF', '123', 'foobar'],
      ensure_option: true,
    });
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    view.render();
    expect(
      view.textbox.classList.contains('jpwidgets-invalidComboValue')
    ).to.equal(true);
  });

  it('escapes characters in options', function () {
    const input = [
      'foo"',
      '"><script>alert("foo")</script><a "',
      '" onmouseover=alert(1) "',
    ];
    this.model.set({
      value: 'ABC',
      options: input,
      ensure_option: true,
    });
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    view.render();
    expect(view.datalist!.children.length).to.equal(3);
    for (let i = 0; i < view.datalist!.children.length; ++i) {
      const el = view.datalist!.children[i];
      expect(el.tagName.toLowerCase()).to.equal('option');
      expect(el.getAttributeNames()).to.eqls(['value']);
      expect(el.getAttribute('value')).to.equal(input[i]);
    }
  });

  it('updates datalist children when options are updated', function () {
    this.model.set({
      value: 'ABC',
      options: ['option1', 'option2', 'option3'],
      ensure_option: true,
    });
    const options = { model: this.model };
    const view = new widgets.ComboboxView(options);
    view.render();
    expect(view.datalist!.children.length).to.equal(3);
    for (let i = 0; i < view.datalist!.children.length; ++i) {
      const el = view.datalist!.children[i];
      expect(el.tagName.toLowerCase()).to.equal('option');
      expect(el.getAttributeNames()).to.eqls(['value']);
      expect(el.getAttribute('value')).to.equal(`option${i + 1}`);
    }

    this.model.set({ options: ['option4', 'option5'] });
    expect(view.datalist!.children.length).to.equal(2);
    for (let i = 0; i < view.datalist!.children.length; ++i) {
      const el = view.datalist!.children[i];
      expect(el.tagName.toLowerCase()).to.equal('option');
      expect(el.getAttributeNames()).to.eqls(['value']);
      expect(el.getAttribute('value')).to.equal(`option${i + 4}`);
    }
  });
});
