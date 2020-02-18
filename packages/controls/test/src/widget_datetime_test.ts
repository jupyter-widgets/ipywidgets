// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { DummyManager } from './dummy-manager';

import {
  createTestModel,
  createTestView,
  createTestModelFromSerialized
} from './utils';

import { DatetimeModel, DatetimeView, NaiveDatetimeModel } from '../../lib';

describe('Datetime', () => {
  const date = new Date();

  describe('DatetimeModel', () => {
    it('should be createable', () => {
      const model = createTestModel(DatetimeModel);
      expect(model).to.be.an.instanceof(DatetimeModel);
      expect(model.get('value')).to.be.a('null');
    });

    it('should be createable with a value', () => {
      const state = { value: date };
      const model = createTestModel(DatetimeModel, state);
      expect(model).to.be.instanceof(DatetimeModel);
      expect(model.get('value')).to.equal(date);
    });

    it('should serialize as expected', async () => {
      const state_in = {
        value: {
          year: 2002,
          month: 2,
          date: 20,
          hours: 20,
          minutes: 2,
          seconds: 20,
          milliseconds: 2
        }
      };

      const model = await createTestModelFromSerialized(
        DatetimeModel,
        state_in
      );
      model.widget_manager.register_model(
        model.model_id,
        Promise.resolve(model)
      );

      const state_out = await (model.widget_manager as DummyManager).get_state();
      const models = Object.keys(state_out.state).map(
        k => state_out.state[k].state
      );
      expect(models.length).to.equal(1);
      expect(models[0]._model_name).to.equal('DatetimeModel');
      expect(models[0].value).to.eql(state_in.value);
    });

    it('should deserialize to Date object', async () => {
      const state_in = {
        value: {
          year: 2002,
          month: 2,
          date: 20,
          hours: 20,
          minutes: 2,
          seconds: 20,
          milliseconds: 2
        }
      };

      const model = await createTestModelFromSerialized(
        DatetimeModel,
        state_in
      );
      expect(model.get('value')).to.eql(
        new Date(Date.UTC(2002, 2, 20, 20, 2, 20, 2))
      );
    });

    it('should deserialize null', async () => {
      const state_in = { value: null };

      const model = await createTestModelFromSerialized(
        DatetimeModel,
        state_in
      );
      expect(model.get('value')).to.be.a('null');
    });

    it('should deserialize undefined', async () => {
      const state_in = {};
      const model = await createTestModelFromSerialized(
        DatetimeModel,
        state_in
      );
      expect(model.get('value')).to.be.a('null');
    });
  });

  describe('DatetimeView', () => {
    it('should be createable', async () => {
      const state = {};
      const model = createTestModel(DatetimeModel, state);
      const view = await createTestView(model, DatetimeView);
      expect(view).to.be.an.instanceof(DatetimeView);
      expect(view.model).to.equal(model);
    });
  });

  describe('NaiveDatetimeModel', () => {
    it('should be createable', () => {
      const model = createTestModel(NaiveDatetimeModel);
      expect(model).to.be.an.instanceof(NaiveDatetimeModel);
      expect(model.get('value')).to.be.a('null');
    });

    it('should be createable with a value', () => {
      const state = { value: date };
      const model = createTestModel(NaiveDatetimeModel, state);
      expect(model).to.be.an.instanceof(NaiveDatetimeModel);
      expect(model.get('value')).to.eql(date);
    });

    it('should serialize as expected', async () => {
      const state_in = {
        value: {
          year: 2002,
          month: 2,
          date: 20,
          hours: 20,
          minutes: 2,
          seconds: 20,
          milliseconds: 2
        }
      };

      const model = await createTestModelFromSerialized(
        NaiveDatetimeModel,
        state_in
      );
      model.widget_manager.register_model(
        model.model_id,
        Promise.resolve(model)
      );

      const state_out = await (model.widget_manager as DummyManager).get_state();
      const models = Object.keys(state_out.state).map(
        k => state_out.state[k].state
      );
      expect(models.length).to.eql(1);
      expect(models[0]._model_name).to.eql('NaiveDatetimeModel');
      expect(models[0].value).to.eql(state_in.value);
    });

    it('should deserialize to Date object', async () => {
      const state_in = {
        value: {
          year: 2002,
          month: 2,
          date: 20,
          hours: 20,
          minutes: 2,
          seconds: 20,
          milliseconds: 2
        }
      };

      const model = await createTestModelFromSerialized(
        NaiveDatetimeModel,
        state_in
      );
      expect(model.get('value')).to.eql(new Date(2002, 2, 20, 20, 2, 20, 2));
    });

    it('should deserialize null', async () => {
      const state_in = { value: null };

      const model = await createTestModelFromSerialized(
        NaiveDatetimeModel,
        state_in
      );
      expect(model.get('value')).to.be.a('null');
    });

    it('should deserialize undefined', async () => {
      const state_in = {};
      const model = await createTestModelFromSerialized(
        NaiveDatetimeModel,
        state_in
      );
      expect(model.get('value')).to.be.a('null');
    });
  });
});
