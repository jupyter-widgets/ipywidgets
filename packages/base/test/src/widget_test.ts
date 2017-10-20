import {
  DummyManager, MockComm
} from './dummy-manager';

import {
  expect
} from 'chai';

import * as widgets from '../../lib/';
let WidgetModel = widgets.WidgetModel;

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe('unpack_models', () => {
  let manager;
  let widgetA;
  let widgetB;

  beforeEach(async () => {
    manager = new DummyManager();
    widgetA = await manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.0.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.0.0',
      model_id: 'widgetA',
    });
    widgetB = await manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.0.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.0.0',
      model_id: 'widgetB',
    });
  });
  it('unpacks strings', async () => {
    let serialized = 'IPY_MODEL_widgetA';
    let deserialized = widgetA;
    let value = await widgets.unpack_models(serialized, manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in arrays', async () => {
    let serialized = ['IPY_MODEL_widgetA', 'IPY_MODEL_widgetB', 'IPY_MODEL_widgetA'];
    let deserialized = [widgetA, widgetB, widgetA];
    let value = await widgets.unpack_models(serialized, manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in objects', async () => {
    let serialized = {a: 'IPY_MODEL_widgetA', b: 'IPY_MODEL_widgetB'};
    let deserialized = {a: widgetA, b: widgetB};
    let value = await widgets.unpack_models(serialized, manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in nested objects', async () => {
    let serialized = {
      a: 'IPY_MODEL_widgetA',
      b: ['IPY_MODEL_widgetA', 'IPY_MODEL_widgetB', 'IPY_MODEL_widgetA'],
      c: {d: ['IPY_MODEL_widgetA'], e: 'IPY_MODEL_widgetB'}
    };
    let deserialized = {
      a: widgetA,
      b: [widgetA, widgetB, widgetA], c: {d: [widgetA], e: widgetB}
    };
    let value = await widgets.unpack_models(serialized, manager);
    expect(value).to.deep.equal(deserialized);
  });
});

describe('WidgetModel', () => {
  let setup;
  let manager;
  let comm;
  let widget;
  let serializeToJSON;

  before(async () => {
    setup = async () => {
      manager = new DummyManager();
      comm = new MockComm();
      sinon.spy(comm, 'send');
      widget = new WidgetModel({}, {
        model_id: 'widget',
        widget_manager: manager,
        comm: comm
      });
      // Create some dummy deserializers.  One returns synchronously, and the
      // other asynchronously using a promise.
      serializeToJSON = sinon.spy(() => {
        return 'serialized';
      });
      widget.constructor.serializers = {
        times3: {
          deserialize: (value, manager) => {
            return value * 3.0;
          }
        },
        halve: {
          deserialize: (value, manager) => {
            return Promise.resolve(value / 2.0);
          }
        },
        spy: {
          deserialize: sinon.spy((value, manager) => {
            return 'deserialized';
          }),
          serialize: sinon.spy((value, widget) => {
            return {
              toJSON: serializeToJSON
            };
          })
        }
      };
      widget.constructor._deserialize_state.reset();
    };
    sinon.spy(WidgetModel, '_deserialize_state');
    await setup();
  });

  describe('constructor', () => {
    beforeEach(async () => {
      await setup();
    });

    it('can take initial state', () => {
      let widgetTest = new WidgetModel({a: 1, b: 'b state'}, {
        model_id: 'widget',
        widget_manager: manager,
      });
      expect(widgetTest.attributes).to.deep.equal({
        ...widgetTest.defaults(),
        a: 1,
        b: 'b state'
      });
    });

    it('sets the widget_manager, id, comm, and comm_live properties', () => {
      let widgetDead = new WidgetModel({}, {
        model_id: 'widgetDead',
        widget_manager: manager,
      });
      expect(widgetDead.model_id).to.equal('widgetDead');
      expect(widgetDead.widget_manager).to.equal(manager);
      expect(widgetDead.comm).to.be.undefined;
      expect(widgetDead.comm_live).to.be.false;

      let comm = new MockComm();
      let widgetLive = new WidgetModel({}, {
        model_id: 'widgetLive',
        widget_manager: manager,
        comm: comm
      });
      expect(widgetLive.model_id).to.equal('widgetLive');
      expect(widgetLive.widget_manager).to.equal(manager);
      expect(widgetLive.comm).to.equal(comm);
      expect(widgetLive.comm_live).to.be.true;
    });

    it('initializes state_change and views attributes', async () => {
      let widgetTest = new WidgetModel({a: 1, b: 'b state'}, {
        model_id: 'widget',
        widget_manager: manager,
      });
      let x = await widgetTest.state_change;
      expect(x).to.be.undefined;
      expect(widgetTest.views).to.deep.equal({});
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      await setup();
    });

    it('sends custom messages with the right format', () => {
      let comm = new MockComm();
      let send = sinon.spy(comm, 'send');
      let widgetTest = new WidgetModel({}, {
        model_id: 'widget',
        widget_manager: manager,
        comm: comm
      });
      let data1 = {a: 1, b: 'state'};
      let data2 = {a: 2, b: 'state'};
      let callbacks = {iopub: {}};
      let buffers = [new Int8Array([1, 2, 3])];

      // send two messages to make sure the throttle does not affect sending.
      widgetTest.send(data1, callbacks, buffers);
      widgetTest.send(data2, callbacks, buffers);
      expect(send).to.be.calledTwice;
      expect(send.getCall(0)).to.be.calledWithExactly(
        {method: 'custom', content: data1},
        callbacks,
        {},
        buffers
      );
      expect(send.getCall(1)).to.be.calledWithExactly(
        {method: 'custom', content: data2},
        callbacks,
        {},
        buffers
      );
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      await setup();
    });

    it('calls destroy', () => {
      let destroyed = sinon.spy();
      widget.on('destroy', destroyed);
      widget.close();
      expect(destroyed).to.be.calledOnce;
    });

    it('deletes the reference to the comm', () => {
      widget.close();
      expect(widget.comm).to.be.undefined;
    });

    it('removes views', () => {
      widget.close();
      expect(widget.views).to.be.undefined;
    });

    it('closes and deletes the comm', () => {
      let close = sinon.spy(comm, 'close');
      widget.close();
      expect(close).to.be.calledOnce;
      expect(widget.comm).to.be.undefined;
    });

    it('triggers a destroy event', () => {
      let destroyEventCallback = sinon.spy();
      widget.on('destroy', destroyEventCallback);
      widget.close();
      expect(destroyEventCallback).to.be.calledOnce;
    });

    it('can be called twice', () => {
      widget.close();
      widget.close();
    });
  });

  describe('_handle_comm_closed', () => {
    beforeEach(async () => {
      await setup();
    });

    it('closes model', () => {
      let closeSpy = sinon.spy(widget, 'close');
      widget._handle_comm_closed({});
      expect(closeSpy).to.be.calledOnce;
    });

    it('listens to the widget close event', () => {
      let closeSpy = sinon.spy(widget, 'close');
      widget.comm.close();
      expect(closeSpy).to.be.calledOnce;
    });

    it('triggers a comm:close model event', () => {
      let closeEventCallback = sinon.spy();
      widget.on('comm:close', closeEventCallback);
      widget._handle_comm_closed({});
      expect(closeEventCallback).to.be.calledOnce;
    });
  });

  describe('_handle_comm_msg', () => {
    beforeEach(async () => {
      await setup();
    });

    it('listens to widget messages', async () => {
      await widget.comm._process_msg({
        content: {
          data: {
            method: 'update',
            state: {a: 5}
          }
        }
      });
      console.log(widget.get('a'));
      expect(widget.get('a')).to.equal(5);
    });

    it('handles update messages', async () => {
      let deserialize = widget.constructor._deserialize_state;
      let setState = sinon.spy(widget, 'set_state');
      let state_change = widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {a: 5}
          }
        }
      });
      expect(widget.state_change).to.equal(state_change);
      await state_change;
      expect(deserialize).to.be.calledOnce;
      expect(setState).to.be.calledOnce;
      expect(deserialize).to.be.calledBefore(setState);
      expect(widget.get('a')).to.equal(5);
    });

    it('updates handle various types of binary buffers', async () => {
      let buffer1 = new Uint8Array([1, 2, 3]);
      let buffer2 = new Float64Array([2.3, 6.4]);
      let buffer3 = new Int16Array([10, 20, 30]);
      await widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {a: 5, c: ['start', null, {}]},
            buffer_paths: [['b'], ['c', 1], ['c', 2, 'd']]
          }
        },
        buffers: [buffer1, buffer2.buffer, new DataView(buffer3.buffer)]
      });
      expect(widget.get('a')).to.equal(5);
      expect(widget.get('b')).to.deep.equal(new DataView(buffer1.buffer));
      expect(widget.get('c')).to.deep.equal(['start', new DataView(buffer2.buffer),
        {d: new DataView(buffer3.buffer)}]);
    });

    it('handles custom deserialization', async () => {
      await widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {halve: 10, times3: 4},
          }
        }
      });
      expect(widget.get('halve')).to.equal(5);
      expect(widget.get('times3')).to.equal(12);
    });

    it('handles custom messages', () => {
      let customEventCallback = sinon.spy();
      widget.on('msg:custom', customEventCallback);
      widget._handle_comm_msg({
        content: {
          data: {method: 'custom'}
        }
      });
      expect(customEventCallback).to.be.calledOnce;
    });
  });

  describe('_deserialize_state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('deserializes simple JSON state', async () => {
      let state = await widget.constructor._deserialize_state(
          { a: 10, b: [{c: 'test1', d: ['test2']}, 20]}, manager);
      expect(state.a).to.equal(10);
      expect(state.b).to.deep.equal([{c: 'test1', d: ['test2']}, 20]);
    });

    it('respects custom serializers', async () => {
      let state = await widget.constructor._deserialize_state(
          { times3: 2.0, halve: 2.0, c: 2.0 }, manager);
      expect(state.times3).to.equal(6.0);
      expect(state.halve).to.equal(1.0);
      expect(state.c).to.equal(2.0);
    });

    it('calls the deserializer with appropriate arguments', async () => {
      /* tslint:disable */
      let state = await widget.constructor._deserialize_state({spy: 'value'}, manager);
      /* tslint:enable */

      let spy = widget.constructor.serializers.spy.deserialize;
      expect(spy).to.be.calledOnce;
      expect(spy).to.be.calledWithExactly('value', manager);
    });
  });

  describe('serialize', () => {
    beforeEach(async () => {
      await setup();
    });

    it('does simple serialization by copying values', () => {
      const b = {c: 'start'};
      const state = {
        a: 5,
        b: b
      };
      const serialized_state = widget.serialize(state);
      // b state was copied
      expect(serialized_state.b).to.not.equal(b);
      expect(serialized_state).to.deep.equal({a: 5, b: b});
    });

    it('serializes null values', () => {
      const state_with_null = {
        a: 5,
        b: null
      };
      const serialized_state = widget.serialize(state_with_null);
      expect(serialized_state.b).to.equal(null);
    });

    it('calls custom serializers with appropriate arguments', () => {
      /* tslint:disable */
      let serialized_state = widget.serialize({spy: 'value'});
      /* tslint:enable */

      let spy = widget.constructor.serializers.spy.serialize;
      expect(spy).to.be.calledWithExactly('value', widget);
    });

    it('calls toJSON method if possible', () => {
      let serialized_state = widget.serialize({spy: 'value'});
      let spy = serializeToJSON;
      expect(spy).to.be.calledOnce;
      expect(serialized_state).to.deep.equal({spy: 'serialized'});
    });
  });

  describe('_handle_comm_msg', () => {
    beforeEach(async () => {
      await setup();
    });

    it('handles update messages', async () => {
      let deserialize = widget.constructor._deserialize_state;
      let setState = sinon.spy(widget, 'set_state');
      let state_change = widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {a: 5}
          }
        }
      });
      expect(widget.state_change).to.equal(state_change);
      await state_change;
      expect(deserialize).to.be.calledOnce;
      expect(setState).to.be.calledOnce;
      expect(deserialize).to.be.calledBefore(setState);
      expect(widget.get('a')).to.equal(5);
    });

    it('updates handle various types of binary buffers', async () => {
      let buffer1 = new Uint8Array([1, 2, 3]);
      let buffer2 = new Float64Array([2.3, 6.4]);
      let buffer3 = new Int16Array([10, 20, 30]);
      await widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {a: 5, c: ['start', null, {}]},
            buffer_paths: [['b'], ['c', 1], ['c', 2, 'd']]
          }
        },
        buffers: [buffer1, buffer2.buffer, new DataView(buffer3.buffer)]
      });
      expect(widget.get('a')).to.equal(5);
      expect(widget.get('b')).to.deep.equal(new DataView(buffer1.buffer));
      expect(widget.get('c')).to.deep.equal(['start', new DataView(buffer2.buffer),
        {d: new DataView(buffer3.buffer)}]);
    });

    it('handles custom deserialization', async () => {
      await widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: {halve: 10, times3: 4},
          }
        }
      });
      expect(widget.get('halve')).to.equal(5);
      expect(widget.get('times3')).to.equal(12);
    });

    it('handles custom messages', () => {
      let customEventCallback = sinon.spy();
      widget.on('msg:custom', customEventCallback);
      widget._handle_comm_msg({
        content: {
          data: {method: 'custom'}
        }
      });
      expect(customEventCallback).to.be.calledOnce;
    });
  });

  describe('set_state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('sets the state of the widget', () => {
      expect(widget.get('a')).to.be.undefined;
      expect(widget.get('b')).to.be.undefined;
      widget.set_state({a: 2, b: 3});
      expect(widget.get('a')).to.equal(2);
      expect(widget.get('b')).to.equal(3);
    });
  });

  describe('set', () => {
    beforeEach(async () => {
      await setup();
    });

    it('triggers change events', async () => {
      /* tslint:disable */
      let changeA = sinon.spy(() => {});
      let change = sinon.spy(() => {});
      /* tslint:enable */

      widget.on('change:a', changeA);
      widget.on('change', change);
      widget.set('a', 100);
      expect(changeA).to.be.calledOnce;
      expect(changeA).to.be.calledWith(widget, 100);
      expect(changeA).to.be.calledBefore(change);
      expect(change).to.be.calledWith(widget);
    });
    it('handles multiple values to set', () => {
      expect(widget.get('a')).to.be.undefined;
      expect(widget.get('b')).to.be.undefined;
      widget.set({a: 2, b: 3});
      expect(widget.get('a')).to.equal(2);
      expect(widget.get('b')).to.equal(3);
    });
  });

  describe('save_changes', () => {
    beforeEach(async () => {
      await setup();
    });

    it('remembers changes across multiple set calls', () => {
      sinon.spy(widget, 'save');
      expect(widget.get('a')).to.be.undefined;
      expect(widget.get('b')).to.be.undefined;
      widget.set('a', 2);
      widget.set('b', 5);
      widget.save_changes();
      expect(widget.save).to.be.calledWith({a: 2, b: 5});
    });

    it('will not sync changes done by set_state', () => {
      sinon.spy(widget, 'save');
      expect(widget.get('a')).to.be.undefined;
      expect(widget.get('b')).to.be.undefined;
      /* tslint:disable*/
      widget.on('change:a', ()=> {
        widget.set('b', 15);
      });
      /* tslint:enable */

      widget.set_state({a: 10});
      expect(widget.get('a')).to.equal(10);
      expect(widget.get('b')).to.equal(15);
      widget.save_changes();
      expect(widget.save).to.be.calledWith({b: 15});
    });
  });

  describe('get_state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('gets all of the state', () => {
      widget.set('a', 'get_state test');
      expect(widget.get_state()).to.deep.equal({
        _model_module: '@jupyter-widgets/base',
        _model_name: 'WidgetModel',
        _model_module_version: '1.0.0',
        _view_module: '@jupyter-widgets/base',
        _view_name: null,
        _view_module_version: '1.0.0',
        _view_count: null,
        a: 'get_state test'
      });
    });

    it('drop_defaults is respected', () => {
      widget.set('a', 'get_state test');
      expect(widget.get_state(true)).to.deep.equal({
        a: 'get_state test'
      });
    });
  });

  describe('callbacks', () => {
    beforeEach(async () => {
      await setup();
    });

    it('returns a blank object', () => {
      expect(widget.callbacks()).to.deep.equal({});
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      await setup();
    });

    it('respects the message throttle', () => {
      let send = sinon.spy(widget, 'send_sync_message');
      widget.set('a', 'sync test');
      widget.save_changes();
      widget.set('a', 'another sync test');
      widget.set('b', 'change b');
      widget.save_changes();
      widget.set('b', 'change b again');
      widget.save_changes();

      // check that one sync message went through
      expect(send).to.be.calledOnce;
      expect(send).to.be.calledWith({
        a: 'sync test'
      });
      // have the comm send a status idle message
      widget._handle_status({
        content: {
          execution_state: 'idle'
        }
      });
      // check that the other sync message went through with the updated values
      expect(send.secondCall).to.be.calledWith({
        a: 'another sync test',
        b: 'change b again'
      });
    });

    it('Initial values are *not* sent on creation', () => {
      expect(comm.send.callCount).to.equal(0);
    });
  });

  describe('send_sync_message', () => {
    beforeEach(async () => {
      await setup();
    });

    it('sends a message', () => {
      widget.send_sync_message({
        a: 'send sync message',
        b: 'b value'
      }, {});
      expect(comm.send).to.be.calledWith({
        method: 'update',
        state: {
          a: 'send sync message',
          b: 'b value'
        },
        buffer_paths: []
      });
    });

    it('handles buffers in messages', () => {
      let buffer = new Uint8Array([1, 2, 3]);
      widget.send_sync_message({
        a: buffer
      });
      expect(comm.send.args[0][0]).to.deep.equal({
        method: 'update',
        state: {},
        buffer_paths: [['a']]
      });
      expect(comm.send.args[0][3]).to.deep.equal([buffer.buffer]);
    });
  });

  describe('on_some_change', () => {
    beforeEach(async () => {
      await setup();
    });

    it('is called once for multiple change notifications', async () => {
      let changeCallback = sinon.spy();
      let someChangeCallback = sinon.spy();
      widget.on('change:a change:b', changeCallback);
      widget.on_some_change(['a', 'b'], someChangeCallback);
      widget.set_state({ a: true, b: true });
      expect(changeCallback.callCount).to.equal(2);
      expect(someChangeCallback).to.be.calledOnce;
    });
  });

  describe('toJSON', () => {
    beforeEach(async () => {
      await setup();
    });

    it('encodes the widget', () => {
      expect(widget.toJSON()).to.equal(`IPY_MODEL_${widget.model_id}`);
    });
  });
});
