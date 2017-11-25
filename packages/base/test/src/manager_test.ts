import {
    DummyManager, MockComm
} from './dummy-manager';

import * as widgets from '../../lib';

import {
    expect
} from 'chai';

import * as chai from 'chai';

import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
chai.use(sinonChai);




// test ManagerBase by creating a simple derived class
// and testing it.

describe('ManagerBase', function() {
    beforeEach(function() {
        this.managerBase = new DummyManager();
        this.modelOptions = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
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
      it('calls create_view and display_view', async function() {
        let manager = this.managerBase;
        sinon.spy(manager, 'create_view');
        sinon.spy(manager, 'display_view');
        let msg = {msg: true};
        let viewOptions = {viewOptions: true};
        let model = await manager.new_model(this.modelOptions);
        await manager.display_model(msg, model, viewOptions);
        expect(manager.create_view.calledWith(model, viewOptions)).to.be.true;
        expect(manager.display_view.calledWith(msg)).to.be.true;
        expect(manager.display_view.getCall(0).args[2]).to.deep.equal(viewOptions);
      });
    });

    describe('setViewOptions', function() {
      it('returns an object', function() {
        expect(this.managerBase.setViewOptions()).to.deep.equal({});
      });
      it('returns the passed options', function() {
        let options = {a: 1};
        expect(this.managerBase.setViewOptions(options)).to.deep.equal(options);
      });
    });

    describe('create_view', function() {
      it('returns a Promise to a view', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        let view = await manager.create_view(model);
        expect(view).to.be.instanceof(widgets.WidgetView);
        expect(view.model).to.equal(model);
      });

      it('renders the view', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model({
            model_name: 'BinaryWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            model_id: 'u-u-i-d'
        });
        let view = await manager.create_view(model);
        expect(view._rendered).to.equal(1);
      });

      it('removes the view on model destroy', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        let view = await manager.create_view(model);
        // TODO: when we upgrade sinon-chai to handle chai 4.0,
        // uncomment the following and the test statement
        // sinon.spy(view, 'remove');
        await model.close();
        // expect(view.removed.calledOnce).to.be.true;
        expect(view._removed).to.equal(1);
      });

      it('accepts optional view options, which it sends through setViewOptions', async function() {
        let manager = this.managerBase;
        sinon.spy(manager, 'setViewOptions');
        let model = await manager.new_model(this.modelOptions);
        let options = {a: 1};
        let view = await manager.create_view(model, options);
        expect(manager.setViewOptions.calledWith(options)).to.be.true;
        expect(view.options).to.deep.equal(options);
      });

      it('registers itself with the model.views, deleted when removed', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        let view = await manager.create_view(model);
        // model.views contains some promise which resolves to the view
        let modelViews = await Promise.all(Object.keys(model.views).map(i => model.views[i]));
        expect(modelViews).to.contain(view);
        view.remove();
        let modelViews2 = await Promise.all(Object.keys(model.views).map(i => model.views[i]));
        expect(modelViews2).to.not.contain(view);
      });
    });

    describe('callbacks', function() {
      it('returns an object', function() {
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
      });
    });

    describe('get_model', function() {
      it('returns a promise to the model', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        expect(await manager.get_model(model.model_id)).to.be.equal(model);
      });

      it('returns undefined when model is not registered', function() {
        expect(this.managerBase.get_model('not-defined')).to.be.undefined;
      });
    });

    describe('handle_comm_open', function() {
      it('returns a promise to a model', async function() {
        let manager = this.managerBase;
        let comm = new MockComm();
        let model = await manager.handle_comm_open(comm, {
          content: {
            data: {
              state: {
                _model_name: 'TestWidget',
                _model_module: 'test-widgets',
                _model_module_version: '1.0.0',
                value: 50
              }
            }
          },
          metadata: {
            version: '2.0.0'
          }
        });
        expect(model.comm).to.equal(comm);
        expect(model.get('value')).to.equal(50);
      });

      it('throws if widget protocol version is not specified', async function() {
        let manager = this.managerBase;
        let comm = new MockComm();
        let model = manager.handle_comm_open(comm, {
          content: {
            data: {
              state: {
                _model_name: 'TestWidget',
                _model_module: 'test-widgets',
                _model_module_version: '1.0.0',
                value: 50
              }
            }
          },
        });
        expect(model).to.be.rejected;
      });

      it('throws if widget protocol version is not compatible', async function() {
        let manager = this.managerBase;
        let comm = new MockComm();
        let model = manager.handle_comm_open(comm, {
          content: {
            data: {
              state: {
                _model_name: 'TestWidget',
                _model_module: 'test-widgets',
                _model_module_version: '1.0.0',
                value: 50
              }
            }
          },
          metadata: {
            version: '1.0'
          }
        });
        expect(model).to.be.rejected;
      });

      it('allows setting initial state, including binary state', async function() {
        let manager = this.managerBase;
        let comm = new MockComm();
        let model = await manager.handle_comm_open(comm, {
          content: {
            data: {
              state: {
                _model_name: 'BinaryWidget',
                _model_module: 'test-widgets',
                _model_module_version: '1.0.0',
                array: {dtype: 'uint8'}
              },
              buffer_paths: [['array', 'buffer']]
            }
          },
          buffers: [new DataView((new Uint8Array([1, 2, 3])).buffer)],
          metadata: {
            version: '2.0.0'
          }
        });
        expect(model.comm).to.equal(comm);
        expect(model.get('array')).to.deep.equal(new Uint8Array([1, 2, 3]));
      });
    });

    describe('new_widget', function() {
      it('syncs once on creation', async function() {
        let comm = new MockComm();
        sinon.spy(comm, 'send');
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            view_name: 'TestView',
            view_module: 'test-widgets',
            view_module_version: '1.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_widget(spec);
        expect((comm.send as any).calledOnce).to.be.true;
      });

      it('rejects if view information is not passed in', async function() {
        let comm = new MockComm();
        sinon.spy(comm, 'send');
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        expect(manager.new_widget(spec)).to.be.rejectedWith('new_widget(...) must be given view information in the options.');
      });

      it('creates a comm if one is not passed in', async function() {
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            view_name: 'TestView',
            view_module: 'test-widgets',
            view_module_version: '1.0.0',
        };
        let manager = this.managerBase;
        let model = await manager.new_widget(spec);
        expect(model.comm).to.not.be.undefined;
      });

      it('creates a model even if the comm creation has errors', async function() {
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            view_name: 'TestView',
            view_module: 'test-widgets',
            view_module_version: '1.0.0',
        };
        class NewWidgetManager extends DummyManager {
          _create_comm() {
            return Promise.reject('failed creation');
          }
        }
        let manager = new NewWidgetManager();
        let model = await manager.new_widget(spec);
        expect(model.comm).to.be.undefined;
        expect(model.model_id).to.not.be.undefined;
      });
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
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_model(spec);
        expect(model.model_id).to.be.equal(comm.comm_id);
      });

      it('rejects if model_id or comm not given', async function() {
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
        };
        let manager = this.managerBase;
        expect(manager.new_model(spec)).to.be.rejectedWith('Neither comm nor model_id provided in options object. At least one must exist.');
      });

      it('throws an error if there is an error loading the class');

      it('does not sync on creation', async function() {
        let comm = new MockComm();
        sinon.spy(comm, 'send');
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_model(spec);
        expect((comm.send as any).notCalled).to.be.true;
      });

      it('calls loadClass to retrieve model class', async function() {
        let manager = this.managerBase;
        let spy = sinon.spy(manager, 'loadClass');
        let model = await manager.new_model(this.modelOptions);
        expect(manager.loadClass.calledOnce).to.be.true;
      });

      it('deserializes attributes using custom serializers and handles binary state', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model({
            model_name: 'BinaryWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            model_id: 'u-u-i-d'
        }, {array: {
          dtype: 'uint8',
          buffer: new DataView((new Uint8Array([1, 2, 3]).buffer))
        }});
        expect(model.get('array')).to.deep.equal(new Uint8Array([1, 2, 3]));
      });

      it('sets up a comm close handler to delete the model', async function() {
        let callback = sinon.spy();
        let comm = new MockComm();
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            comm: comm
        };
        let manager = this.managerBase;
        let model = await manager.new_model(spec);
        comm.close();
        expect(manager.get_model(model.model_id)).to.be.undefined;
      });
    });

    describe('clear_state', function() {
      it('clears the model dictionary and closes widgets', async function() {
        let spec = {
            model_name: 'TestWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
        };
        let comm1 = new MockComm();
        let comm2 = new MockComm();
        sinon.spy(comm1, 'close');
        sinon.spy(comm2, 'close');
        let mSpec1 = { ...spec, comm: comm1};
        let mSpec2 = { ...spec, comm: comm2};
        let manager = this.managerBase;
        let model1 = await manager.new_model(mSpec1);
        let model2 = await manager.new_model(mSpec2);
        expect(await manager.get_model(model1.model_id)).to.be.equal(model1);
        expect(await manager.get_model(model2.model_id)).to.be.equal(model2);
        await manager.clear_state();
        expect(manager.get_model(model1.model_id)).to.be.undefined;
        expect(manager.get_model(model2.model_id)).to.be.undefined;
        expect((comm1.close as any).calledOnce).to.be.true;
        expect((comm2.close as any).calledOnce).to.be.true;
        expect(model1.comm).to.be.undefined;
        expect(model2.comm).to.be.undefined;
      });
    });

    describe('get_state', function() {
      it('returns a valid schema', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions);
        let state = await manager.get_state();

        let expectedState = {
          'version_major': 2,
          'version_minor': 0,
          'state': {
            'u-u-i-d': {
              'model_name': 'TestWidget',
              'model_module': 'test-widgets',
              'model_module_version': '1.0.0',
              'state': {
                '_model_module': 'test-widgets',
                '_model_name': 'TestWidget',
                '_model_module_version': '1.0.0',
                '_view_module': 'test-widgets',
                '_view_name': 'TestWidgetView',
                '_view_module_version': '1.0.0',
                '_view_count': null,
        }}}};
        expect(state).to.deep.equal(expectedState);
      });

      it('handles the drop_defaults option', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model(this.modelOptions,
          {value: 50});
        let state = await manager.get_state({drop_defaults: true});
        let expectedState = {
          'version_major': 2,
          'version_minor': 0,
          'state': {
            'u-u-i-d': {
              'model_name': 'TestWidget',
              'model_module': 'test-widgets',
              'model_module_version': '1.0.0',
              'state': {
                'value': 50
        }}}};
        expect(state).to.deep.equal(expectedState);
      });

      it('encodes binary buffers to base64 using custom serializers', async function() {
        let manager = this.managerBase;
        let model = await manager.new_model({
            model_name: 'BinaryWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            model_id: 'u-u-i-d'
        }, {array: {
          dtype: 'uint8',
          buffer: new DataView((new Uint8Array([1, 2, 3]).buffer))
        }});
        let state = await manager.get_state({drop_defaults: true});
        let expectedState = {
          'version_major': 2,
          'version_minor': 0,
          'state': {
            'u-u-i-d': {
              'model_name': 'BinaryWidget',
              'model_module': 'test-widgets',
              'model_module_version': '1.0.0',
              'state': {
                'array': {'dtype': 'uint8'}
              },
              'buffers': [{
                'data': 'AQID',
                'path': ['array', 'buffer'],
                'encoding': 'base64'
              }]
        }}};
        expect(state).to.deep.equal(expectedState);
      });
    });

    describe('set_state', function() {
      it('handles binary base64 buffers', async function() {
        let state = {
          'version_major': 2,
          'version_minor': 0,
          'state': {
            'u-u-i-d': {
              'model_name': 'BinaryWidget',
              'model_module': 'test-widgets',
              'model_module_version': '1.0.0',
              'state': {
                'array': {'dtype': 'uint8'}
              },
              'buffers': [{
                'data': 'AQID',
                'path': ['array', 'buffer'],
                'encoding': 'base64'
              }]
        }}};
        let manager = this.managerBase;
        await manager.set_state(state);
        let model = await manager.get_model('u-u-i-d');
        expect(model.get('array')).to.deep.equal(new Uint8Array([1, 2, 3]));
      });

      it('handles binary hex buffers', async function() {
        let state = {
          'version_major': 2,
          'version_minor': 0,
          'state': {
            'u-u-i-d': {
              'model_name': 'BinaryWidget',
              'model_module': 'test-widgets',
              'model_module_version': '1.0.0',
              'state': {
                'array': {'dtype': 'uint8'}
              },
              'buffers': [{
                'data': '010203',
                'path': ['array', 'buffer'],
                'encoding': 'hex'
              }]
        }}};
        let manager = this.managerBase;
        await manager.set_state(state);
        let model = await manager.get_model('u-u-i-d');
        expect(model.get('array')).to.deep.equal(new Uint8Array([1, 2, 3]));
      });
    });
});

