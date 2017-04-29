import {
    DummyManager
} from './dummy-manager';

import {
    expect
} from 'chai';

// test ManagerBase by creating a simple derived class
// and testing it.

describe("ManagerBase", function() {
    beforeEach(function() {
        this.managerBase = new DummyManager();
        // add a model and a view

    });

    describe('comm_target_name', function() {
        it('is "jupyter.widget"', function() {
          expect(this.managerBase.comm_target_name).to.equal('jupyter.widget');
        });
    });

    describe('display_model', function() {
      it('exists', function() {
        expect(this.managerBase.display_model).to.not.be.undefined;
      });
    });

    describe('setViewOptions', function() {
      it('exists', function() {
        expect(this.managerBase.setViewOptions).to.not.be.undefined;
      });
    });

    describe('create_view', function() {
      it('exists', function() {
        expect(this.managerBase.create_view).to.not.be.undefined;
      });
    });

    describe('callbacks', function() {
      it('returns an object without an iopub', function() {
        // Cell-less call
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
        expect(c.iopub).to.be.undefined;
      });
    });

    describe('get_model', function() {
      it('exists', function() {
        expect(this.managerBase.get_model).to.not.be.undefined;
      });
      it('returns a promise to the model');
    });

    describe('handle_comm_open', function() {
      it('exists', function() {
        expect(this.managerBase.handle_comm_open).to.not.be.undefined;
      });
    });

    describe('new_widget', function() {
      it('exists', function() {
        expect(this.managerBase.new_widget).to.not.be.undefined;
      });
      it('syncs once on creation');
    });

    describe('new_model', function() {
      it('model has a get', async function() {
      let model = await this.managerBase.new_model({
            model_name: 'IntSlider',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            model_id: 'u-u-i-d'
        });
      expect(model).to.have.property('get');
    });
    it('model is stored in manager _models', async function() {
      let model = await this.managerBase.new_model({
            model_name: 'IntSlider',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            model_id: 'u-u-i-d'
        });
      let storedModel = await this.managerBase._models[model.id];
      expect(storedModel).to.equal(model);
    });
    it('does not sync on creation');

  });
    describe('clear_state', function() {
      it('exists', function() {
        expect(this.managerBase.clear_state).to.not.be.undefined;
      });
    });

    describe('get_state', function() {
      it('exists', function() {
        expect(this.managerBase.get_state).to.not.be.undefined;
      });
    });

    describe('set_state', function() {
      it('exists', function() {
        expect(this.managerBase.set_state).to.not.be.undefined;
      });
    });
});

