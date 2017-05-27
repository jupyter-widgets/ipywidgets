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

describe("unpack_models", function() {
    beforeEach(async function() {
        this.manager = new DummyManager();
        this.widgetA = await this.manager.new_widget({
            model_name: 'WidgetModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            model_id: 'widgetA',
        })
        this.widgetB = await this.manager.new_widget({
            model_name: 'WidgetModel',
            model_module: 'jupyter-js-widgets',
            model_module_version: '3.0.0',
            model_id: 'widgetB',
        });
    })
    it('unpacks strings', async function() {
        let serialized = 'IPY_MODEL_widgetA';
        let deserialized = this.widgetA;
        let value = await widgets.unpack_models(serialized, this.manager);
        expect(value).to.deep.equal(deserialized);
    })
    it('recurses in arrays', async function() {
        let serialized = ['IPY_MODEL_widgetA', 'IPY_MODEL_widgetB', 'IPY_MODEL_widgetA'];
        let deserialized = [this.widgetA, this.widgetB, this.widgetA];
        let value = await widgets.unpack_models(serialized, this.manager);
        expect(value).to.deep.equal(deserialized);
    });
    it('recurses in objects', async function() {
        let serialized = {a: 'IPY_MODEL_widgetA', b: 'IPY_MODEL_widgetB'};
        let deserialized = {a: this.widgetA, b: this.widgetB};
        let value = await widgets.unpack_models(serialized, this.manager);
        expect(value).to.deep.equal(deserialized);
    });
    it('recurses in nested objects', async function() {
        let serialized = {a: 'IPY_MODEL_widgetA', b: ['IPY_MODEL_widgetA', 'IPY_MODEL_widgetB', 'IPY_MODEL_widgetA'], c: {d: ['IPY_MODEL_widgetA'], e: 'IPY_MODEL_widgetB'}};
        let deserialized = {a: this.widgetA, b: [this.widgetA, this.widgetB, this.widgetA], c: {d: [this.widgetA], e: this.widgetB}};
        let value = await widgets.unpack_models(serialized, this.manager);
        expect(value).to.deep.equal(deserialized);
    })
});

describe("WidgetModel", function() {
    beforeEach(async function() {
        this.manager = new DummyManager();
        let comm = new MockComm();
        this.widget = new WidgetModel({}, {
            model_id: 'widget',
            widget_manager: this.manager,
            comm: comm
        });
    });

    describe('constructor', function() {
        it('can take initial state', function() {
            let widget = new WidgetModel({a: 1, b: 'b state'}, {
                model_id: 'widget',
                widget_manager: this.manager,
            })
            expect(widget.attributes).to.deep.equal({
                ...widget.defaults(),
                a: 1,
                b: 'b state'
            });
        });

        it('sets the widget_manager, id, comm, and comm_live properties', function() {
            let widgetDead = new WidgetModel({}, {
                model_id: 'widgetDead',
                widget_manager: this.manager,
            });
            expect(widgetDead.id).to.equal('widgetDead');
            expect(widgetDead.widget_manager).to.equal(this.manager);
            expect(widgetDead.comm).to.be.undefined;
            expect(widgetDead.comm_live).to.be.false;

            let comm = new MockComm();
            let widgetLive = new WidgetModel({}, {
                model_id: 'widgetLive',
                widget_manager: this.manager,
                comm: comm
            });
            expect(widgetLive.id).to.equal('widgetLive');
            expect(widgetLive.widget_manager).to.equal(this.manager);
            expect(widgetLive.comm).to.equal(comm);
            expect(widgetLive.comm_live).to.be.true;
        });

        it('initializes state_change and views attributes', async function() {
            let widget = new WidgetModel({a: 1, b: 'b state'}, {
                model_id: 'widget',
                widget_manager: this.manager,
            })
            let x = await widget.state_change;
            expect(x).to.be.undefined;
            expect(widget.views).to.deep.equal({});
        });
    });

    describe('send', function() {
        it('sends custom messages with the right format', function() {
            let comm = new MockComm();
            let send = sinon.spy(comm, 'send');
            let widget = new WidgetModel({}, {
                model_id: 'widget',
                widget_manager: this.manager,
                comm: comm
            });
            let data1 = {a: 1, b: 'state'};
            let data2 = {a: 2, b: 'state'};
            let callbacks = {iopub: {}};
            let buffers = [new Int8Array([1,2,3])]

            // send two messages to make sure the throttle does not affect sending.
            widget.send(data1, callbacks, buffers);
            widget.send(data2, callbacks, buffers);
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

    describe('close', function() {
        beforeEach(function() {
            this.comm = new MockComm();
            this.widget = new WidgetModel({}, {
                model_id: 'widget',
                widget_manager: this.manager,
                comm: this.comm
            });
        });

        it('calls destroy', function() {
            let destroyed = sinon.spy();
            this.widget.on('destroy', destroyed);
            this.widget.close();
            expect(destroyed).to.be.calledOnce;
        });

        it('deletes the reference to the comm', function() {
            this.widget.close();
            expect(this.widget.comm).to.be.undefined;
        });

        it('removes views', function() {
            this.widget.close();
            expect(this.widget.views).to.be.undefined;
        });

        it('closes and deletes the comm', function() {
            let close = sinon.spy(this.comm, 'close');
            this.widget.close();
            expect(close).to.be.calledOnce;
            expect(this.widget.comm).to.be.undefined;
        });

        it('triggers a destroy event', function() {
            let destroyEventCallback = sinon.spy();
            this.widget.on('destroy', destroyEventCallback);
            this.widget.close();
            expect(destroyEventCallback).to.be.calledOnce;
        });

        it('can be called twice', function() {
            this.widget.close();
            this.widget.close();
        });
    });

    describe('_handle_comm_closed', function() {
        it('closes model', function() {
            let closeSpy = sinon.spy(this.widget, "close");
            this.widget._handle_comm_closed({});
            expect(closeSpy).to.be.calledOnce;
        });

        it('triggers a comm:close model event', function() {
            let closeEventCallback = sinon.spy();
            this.widget.on('comm:close', closeEventCallback);
            this.widget._handle_comm_closed({});
            expect(closeEventCallback).to.be.calledOnce;

        })
    });

// DONE ABOVE HERE

    describe('_deserialize_state', function() {
        it('exists', function() {
            expect(this.widget.constructor._deserialize_state).to.not.be.undefined;

            // Create some dummy deserializers.  One returns synchronously, and the
            // other asynchronously using a promise.
            this.widget.constructor.serializers = {
                times3: {
                    deserialize: (value, manager) => {
                        return value*3.0;
                    }
                },
                halve: {
                    deserialize: (value, manager) => {
                        return Promise.resolve(value/2.0);
                    }
                }
            };

            let deserialized = this.widget.constructor._deserialize_state({ times3: 2.0, halve: 2.0, c: 2.0 });
            expect(deserialized).to.be.an.instanceof(Promise);
            return deserialized.then(state => {
                expect(state.times3).to.equal(6.0);
                expect(state.halve).to.equal(1.0);
                expect(state.c).to.equal(2.0);
            });
        });
    });

    describe('serialize', function() {
        it('does simple serialization', function() {
            expect(this.widget.serialize).to.not.be.undefined;
            const state = {
                a: 5,
                b: 'some-string'
            };
            const serialized_state = this.widget.serialize(state);
            expect(serialized_state).to.be.an('object');
            expect(serialized_state).to.deep.equal(state);
        });

        it('seralizes null values', function() {
            const state_with_null = {
                a: 5,
                b: null
            };
            const serialized_state = this.widget.serialize(state_with_null);
            expect(serialized_state).to.be.an('object');
            expect(serialized_state).to.deep.equal(state_with_null);
        });

        it('serializes with custom serializers', function() {
            const state = {
                a: 5,
                need_custom_serializer: {
                    use_this: 6,
                    ignored: 'should not get serialized'
                }
            };
            this.widget.constructor.serializers = {
                ...this.widget.constructor.serializers,
                need_custom_serializer: {
                    serialize: (value) => value.use_this
                }
            };
            const serialized_state = this.widget.serialize(state);
            expect(serialized_state).to.deep.equal({
                a: 5,
                need_custom_serializer: 6
            });
        });
    });

    describe('_handle_comm_msg', function() {
        it('handles update messages', async function() {
            let deserialize = sinon.spy(this.widget.constructor, '_deserialize_state');
            let setState = sinon.spy(this.widget, 'set_state');
            let state_change = this.widget._handle_comm_msg({
                content: {
                    data: {
                        method: 'update',
                        state: {a: 5}
                    }
                }
            });
            expect(this.widget.state_change).to.equal(state_change);
            await state_change;
            expect(deserialize).to.be.calledOnce;
            expect(setState).to.be.calledOnce;
            expect(deserialize).to.be.calledBefore(setState);
            expect(this.widget.get('a')).to.equal(5);
        });

        it('updates handle binary buffers (that are not DataViews)');
        it('calls the custom deserialization appropriately');
        it('calls the set_state with deserialized state');
        it('handles custom messages', function() {
            let customEventCallback = sinon.spy();
            this.widget.on('msg:custom', customEventCallback);
            this.widget._handle_comm_msg({
                content: {
                    data: {method: 'custom'}
                }
            });
            expect(customEventCallback).to.be.calledOnce;
        });
    });

    describe('set_state', function() {
        it('sets the state of the widget', function() {
            expect(this.widget.get('a')).to.be.undefined;
            this.widget.set_state({a: 2});
            expect(this.widget.get('a')).to.equal(2);
        });
    });

    describe('set', function() {
        it('does not note as changed attributes that are currently being set in set_state (i.e., uses _state_lock');
    })

    describe('get_state', function() {
        it('exists', function() {
            expect(this.widget.get_state).to.not.be.undefined;
            expect(this.widget.get_state.bind(this)).to.not.throw();
        });
        it('gets all of the state');
        it('drop_defaults is respected');
    });

    describe('_handle_status', function() {
        it('exists', function() {
            expect(this.widget._handle_status).to.not.be.undefined;
        });
    });

    describe('callbacks', function() {
        it('exists', function() {
            let c = this.widget.callbacks();
            expect(c).to.be.an('object');
        });
    });

    describe('set', function() {
        it('exists', function() {
            expect(this.widget.set).to.not.be.undefined;
        });
    });

    describe('sync', function() {
        it('exists', function() {
            expect(this.widget.sync).to.not.be.undefined;
        });
        it('respects the message throttle');
        it('updates messages that are throttled');
        it('sync right after creation does *not* send initial values')
    });

    describe('serialize', function() {
        it('exists');
    })

    describe('send_sync_message', function() {
        it('exists', function() {
            expect(this.widget.send_sync_message).to.not.be.undefined;
        });
    });

    describe('save_changes', function() {
        it('exists', function() {
            expect(this.widget.save_changes).to.not.be.undefined;
        });
    });

    describe('on_some_change', function() {
        it('exists', function() {
            expect(this.widget.on_some_change).to.not.be.undefined;

            let changeCallback = sinon.spy();
            let someChangeCallback = sinon.spy();
            this.widget.on('change:a change:b', changeCallback, this.widget);
            this.widget.set_state({ a: true, b: true });

            return this.widget.state_change.then(() => {
                expect(changeCallback.callCount).to.equal(2);

                this.widget.on_some_change(['a', 'b'], someChangeCallback, this.widget);
                this.widget.set_state({ a: false, b: false });
                return this.widget.state_change;
            }).then(() => {
                expect(someChangeCallback.calledOnce).to.be.true;
            });
        });
    });

    describe('toJSON', function() {
        it('exists', function() {
            expect(this.widget.toJSON).to.not.be.undefined;
            expect(this.widget.toJSON()).to.be.a('string');
        });
    });
    describe('static _deserialize_state works', function() {
        it('works');
    })
});
