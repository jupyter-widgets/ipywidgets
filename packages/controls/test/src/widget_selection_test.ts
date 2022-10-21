// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { createTestModel, createTestView } from './utils';

import {
  DropdownModel,
  DropdownView,
  SelectModel,
  SelectView,
  SelectMultipleModel,
  SelectMultipleView,
} from '../../lib';

describe('Dropdown', () => {
  describe('DropdownModel', () => {
    it('should be createable', () => {
      const model = createTestModel(DropdownModel);
      expect(model).to.be.an.instanceof(DropdownModel);
      expect(model.get('index')).to.equal('');
      expect(model.get('_options_labels')).to.eql([]);
    });

    it('should be creatable with a state', () => {
      const state = { _options_labels: ['A', 'B', 'C'], index: 1 };
      const model = createTestModel(DropdownModel, state);
      expect(model).to.be.an.instanceof(DropdownModel);
      expect(model.get('index')).to.equal(1);
      expect(model.get('_options_labels')).to.eql(['A', 'B', 'C']);
    });
  });

  describe('DropdownView', () => {
    it('should be createable', async () => {
      const model = createTestModel(DropdownModel);
      const view = await createTestView(model, DropdownView);
      expect(view).to.be.an.instanceof(DropdownView);
      expect(view.model).to.equal(model);
    });

    it('should handle a set independent of order', async () => {
      const model = createTestModel(DropdownModel);
      const view = await createTestView(model, DropdownView);
      expect(view).to.be.an.instanceof(DropdownView);
      model.set_state({ _options_labels: ['A', 'B', 'C'], index: 1 });
      expect(view.listbox.selectedIndex).to.equal(1, 'order 1 failed');
      model.set_state({ _options_labels: [], index: null });
      expect(view.listbox.selectedIndex).to.equal(-1);
      model.set_state({ index: 1, _options_labels: ['A', 'B', 'C'] });
      expect(view.listbox.selectedIndex).to.equal(1, 'order 2 failed');
    });
  });
});

describe('Select', () => {
  describe('SelectModel', () => {
    it('should be createable', () => {
      const model = createTestModel(SelectModel);
      expect(model).to.be.an.instanceof(SelectModel);
      expect(model.get('index')).to.equal('');
      expect(model.get('_options_labels')).to.eql([]);
    });

    it('should be creatable with a state', () => {
      const state = { _options_labels: ['A', 'B', 'C'], index: 1 };
      const model = createTestModel(SelectModel, state);
      expect(model).to.be.an.instanceof(SelectModel);
      expect(model.get('index')).to.equal(1);
      expect(model.get('_options_labels')).to.eql(['A', 'B', 'C']);
    });
  });

  describe('SelectView', () => {
    it('should be createable', async () => {
      const model = createTestModel(SelectModel);
      const view = await createTestView(model, SelectView);
      expect(view).to.be.an.instanceof(SelectView);
      expect(view.model).to.equal(model);
    });

    it('should handle a set independent of order', async () => {
      const model = createTestModel(SelectModel);
      const view = await createTestView(model, SelectView);
      expect(view).to.be.an.instanceof(SelectView);
      model.set_state({ _options_labels: ['A', 'B', 'C'], index: 1 });
      expect(view.listbox.selectedIndex).to.equal(1, 'order 1 failed');
      model.set_state({ _options_labels: [], index: null });
      expect(view.listbox.selectedIndex).to.equal(-1);
      model.set_state({ index: 1, _options_labels: ['A', 'B', 'C'] });
      expect(view.listbox.selectedIndex).to.equal(1, 'order 2 failed');
    });
  });
});

describe('SelectMultiple', () => {
  describe('SelectMultipleModel', () => {
    it('should be createable', () => {
      const model = createTestModel(SelectMultipleModel);
      expect(model).to.be.an.instanceof(SelectMultipleModel);
      expect(model.get('index')).to.equal('');
      expect(model.get('_options_labels')).to.eql([]);
    });

    it('should be creatable with a state', () => {
      const state = { _options_labels: ['A', 'B', 'C'], index: 1 };
      const model = createTestModel(SelectMultipleModel, state);
      expect(model).to.be.an.instanceof(SelectMultipleModel);
      expect(model.get('index')).to.equal(1);
      expect(model.get('_options_labels')).to.eql(['A', 'B', 'C']);
    });
  });

  describe('SelectMultipleView', () => {
    it('should be createable', async () => {
      const model = createTestModel(SelectMultipleModel);
      const view = await createTestView(model, SelectMultipleView);
      expect(view).to.be.an.instanceof(SelectMultipleView);
      expect(view.model).to.equal(model);
    });

    it('should handle a set independent of order', async () => {
      const model = createTestModel(SelectMultipleModel);
      const view = await createTestView(model, SelectMultipleView);
      expect(view).to.be.an.instanceof(SelectMultipleView);
      model.set_state({ _options_labels: ['A', 'B', 'C'], index: [1, 2] });
      expect([...view.listbox.selectedOptions].map((o) => o.index)).to.eql(
        [1, 2],
        'order 1 failed',
      );
      model.set_state({ _options_labels: [], index: null });
      expect([...view.listbox.selectedOptions].map((o) => o.index)).to.eql([]);
      model.set_state({ index: [1, 2], _options_labels: ['A', 'B', 'C'] });
      expect([...view.listbox.selectedOptions].map((o) => o.index)).to.eql(
        [1, 2],
        'order 2 failed',
      );
    });
  });
});
