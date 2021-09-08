// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import {
  createTestModel,
  createTestView,
} from './utils';

import { SelectModel, SelectView } from '../../lib';

describe('Selection', () => {

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
      expect(view.listbox.selectedIndex).to.equal(1, "order 1 failed");
      model.set_state({ _options_labels: [], index: null });
      expect(view.listbox.selectedIndex).to.equal(-1);
      model.set_state({ index: 1, _options_labels: ['A', 'B', 'C'] });
      expect(view.listbox.selectedIndex).to.equal(1, "order 2 failed");
    });
  });
});
