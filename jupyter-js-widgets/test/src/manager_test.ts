import {
    DummyManager, MockComm
} from './dummy-manager';

import {
    expect
} from 'chai';

import * as sinon from 'sinon';

// test ManagerBase by creating a simple derived class
// and testing it.

describe("ManagerBase", function() {
    beforeEach(function() {
        this.managerBase = new DummyManager();
        this.modelOptions = {
            model_name: 'IntSliderModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            model_id: 'u-u-i-d'
        };
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
      it('returns a promise to rendering of a view');
      it('catches errors');
      it('creates view and calls the display_view function');
    });

    describe('setViewOptions', function() {
      it('exists', function() {
        expect(this.managerBase.setViewOptions).to.not.be.undefined;
      });
      it('sets view options that are stored in the view');
    });

    describe('create_view', function() {
      it('exists', function() {
        expect(this.managerBase.create_view).to.not.be.undefined;
      });
      it('returns a Promise');
      it('triggers the view displayed event');

    });

    describe('callbacks', function() {
      it('returns an object', function() {
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
      });
    });

    describe('get_model', function() {
      it('returns a promise to the model', async function() {
        let manager = this.managerBase
        let model = await manager.new_model(this.modelOptions);
        expect(await manager.get_model(model.id)).to.be.equal(model);
      });
      it('returns undefined when model is not registered', function() {
        expect(this.managerBase.get_model('not-defined')).to.be.undefined;
      })
    });

    describe('handle_comm_open', function() {
      it('exists', function() {
        expect(this.managerBase.handle_comm_open).to.not.be.undefined;
      });
      it('returns a promise to a model');
      it('allows setting initial state, including binary state');
    });

    describe('new_widget', function() {
      it('exists', function() {
        expect(this.managerBase.new_widget).to.not.be.undefined;
      });
      it('syncs once on creation');
      it('creates a comm if one is not passed in');
      it('creates a model even if the comm creation has errors');
    });

    describe('new_model', function() {
      it('returns a promise to a model', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        // we check that the model has a .get() method
        expect(model).to.have.property('get');
        expect(model).to.have.property('set');
        expect(model.name).to.be.equal(this.modelOptions.model_name);
        expect(model.module).to.be.equal(this.modelOptions.model_module);
      });
      it('model id defaults to comm id if not specified', async function() {
        let comm = new MockComm();
        let spec = {
            model_name: 'IntSliderModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_model(spec);
        expect(model.id).to.be.equal(comm.comm_id);
      });

      it.skip('throws an error if model_id or comm not given', async function() {
        let spec = {
            model_name: 'IntSliderModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
        };
        let manager = this.managerBase;
        expect(await manager.new_model(spec)).to.throw();
      });
      it('creates an html widget if there is an error loading the class');
      it('does not sync on creation', function() {

      });
      it('calls loadClass to retrieve model class', async function() {
        let manager = this.managerBase;
        var spy = sinon.spy(manager, "loadClass");
        let model = await manager.new_model(this.modelOptions);
        expect(manager.loadClass.calledOnce).to.be.true;
      });
      it('deserializes attributes using custom serializers');
      it('handles binary state');
      it('sets up a comm close handler to delete the model', async function() {
        var callback = sinon.spy();
        let comm = new MockComm();
        let spec = {
            model_name: 'IntSliderModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_model(spec);
        comm.close();
        expect(manager.get_model(model.id)).to.be.undefined;
      });
    });

    describe('clear_state', function() {
      it('exists', function() {
        expect(this.managerBase.clear_state).to.not.be.undefined;
      });
      it('clears the model dictionary', async function() {
        let spec = {
            model_name: 'IntSliderModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
        };
        let mSpec1 = { ...spec, comm: new MockComm()};
        let mSpec2 = { ...spec, comm: new MockComm()};
        let manager = this.managerBase;
        let model1 = await manager.new_model(mSpec1);
        let model2 = await manager.new_model(mSpec2);
        let m1 = await manager.get_model(model1.id);
        expect(await manager.get_model(model1.id)).to.be.equal(model1);
        expect(await manager.get_model(model2.id)).to.be.equal(model2);
        await manager.clear_state();
        expect(manager.get_model(model1.id)).to.be.undefined;
        expect(manager.get_model(model2.id)).to.be.undefined;
      });
      it('clears only commless widgets if comlessOnly is true');
      it('closes the widgets');
    });

    describe('get_state', function() {
      it('exists', function() {
        expect(this.managerBase.get_state).to.not.be.undefined;
      });
      it('returns a valid schema');
      it('encodes binary buffers to base64');
      it('handles custom serializers');
    });

    describe('set_state', function() {
      it('exists', function() {
        expect(this.managerBase.set_state).to.not.be.undefined;
      });
      it('handles binary hex buffers');
      it('handles binary base64 buffers');
      it('handles custom deserializers');
    });
});

