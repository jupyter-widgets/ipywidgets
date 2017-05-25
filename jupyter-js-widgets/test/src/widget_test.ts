import {
    DummyManager
} from './dummy-manager';

import {
    expect
} from 'chai';

import * as widgets from '../../lib/';

import * as sinon from 'sinon';

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
        })
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
        this.modelId = 'test-widget';
        this.widget = await this.manager.new_widget({
            model_module: 'jupyter-js-widgets',
            model_name: 'WidgetModel',
            model_id: this.modelId,
            widget_class: 'ipywidgets.Widget'
        })
    });

    describe('construction', function() {
        it('exists', function() {
            expect(this.manager).to.not.be.undefined;
            expect(this.widget).to.not.be.undefined;
        });
        it('attaches to the comm handlers');
        it('sets comm_live appropriately');
        it('uses the intialization options appropriately');
        it('can take initial state');
    });

    describe('attributes', function() {
        describe('state_change', function() {
            it('exists', function() {
                expect(this.widget.state_change).to.not.be.undefined;
                expect(this.widget.state_change).to.be.an.instanceof(Promise);
            });
        });

        describe('_pending_msgs', function() {
            it('exists', function() {
                expect(this.widget._pending_msgs).to.not.be.undefined;
                // One sync message is sent when a widget is created on the client
                expect(this.widget._pending_msgs).to.equal(1);
            });
        });

        describe('_msg_buffer', function() {
            it('exists', function() {
            expect(this.widget._msg_buffer).to.not.be.undefined;
            expect(this.widget._msg_buffer).to.be.null;
            });
        });

        describe('_state_lock', function() {
            it('exists', function() {
            expect(this.widget._state_lock).to.not.be.undefined;
            expect(this.widget._state_lock).to.be.null;
            });
        });

        describe('id', function() {
            it('exists', function() {
                expect(this.widget.id).to.not.be.undefined;
                expect(this.widget.id).to.be.a('string');
                expect(this.widget.id).to.equal(this.modelId);
            });
        });

        describe('views', function() {
            it('exists', function() {
            expect(this.widget.views).to.not.be.undefined;
            expect(this.widget.views).to.be.an('object');
            });
        });

        describe('comm', function() {
            it('exists', function() {
            expect(this.widget.comm).to.not.be.undefined;
        });
        });

        describe('comm_live', function() {
            it('exists', function() {
            expect(this.widget.comm_live).to.not.be.undefined;
            expect(this.widget.comm_live).to.be.true;
            });
        });
    });

    describe('send', function() {
        it('exists', function() {
        expect(this.widget.send).to.not.be.undefined;
        it('sends the message with the right format');
        // TODO: Test pending message buffer for comm-full widgets
        // let p = this.widget.pending_msgs;
        // this.widget.send({}, {});
        // expect(this.widget.pending_msgs).to.equal(p + 1);
        });
    });

    describe.skip('close', function() {
        it('calls destroy');
        it('deletes the reference to the comm');
        it('removes views');
        it('closes the comm');

        it('exists', function() {
        expect(this.widget.close).to.not.be.undefined;

        let destroyEventCallback = sinon.spy();
        this.widget.on('destroy', destroyEventCallback);

        this.widget.close();
        expect(destroyEventCallback.calledOnce).to.be.true;
        expect(this.widget.comm).to.be.undefined;
        expect(this.widget.model_id).to.be.undefined;
        expect(Object.keys(this.widget.views).length).to.be.equal(0);
        });
    });

    describe('_handle_comm_closed', function() {
        it('exists', function() {
        expect(this.widget._handle_comm_closed).to.not.be.undefined;

        let closeSpy = sinon.spy(this.widget, "close");
        let closeEventCallback = sinon.spy();
        this.widget.on('comm:close', closeEventCallback);

        this.widget._handle_comm_closed({});
        expect(closeEventCallback.calledOnce).to.be.true;
        expect(closeSpy.calledOnce).to.be.true;
        });
    });

    describe('_deserialize_state', function() {
        it('exists', function() {
        expect(this.widget.constructor._deserialize_state).to.not.be.undefined;

        // Create some dummy deserializers.  One returns synchronously, and the
        // other asynchronously using a promise.
        this.widget.constructor.serializers = {
            a: {
                deserialize: (value, manager) => {
                    return value*3.0;
                }
            },
            b: {
                deserialize: (value, manager) => {
                    return Promise.resolve(value/2.0);
                }
            }
        };

        let deserialized = this.widget.constructor._deserialize_state({ a: 2.0, b: 2.0, c: 2.0 });
        expect(deserialized).to.be.an.instanceof(Promise);
        return deserialized.then(state => {
            expect(state.a).to.equal(6.0);
            expect(state.b).to.equal(1.0);
            expect(state.c).to.equal(2.0);
        });
        });
    });

    describe('serialize', function() {
        it('exists', function() {
        expect(this.widget.serialize).to.not.be.undefined;
        const state = {
            a: 5,
            b: 'some-string'
        };
        const serialized_state = this.widget.serialize(state);
        expect(serialized_state).to.be.an('object');
        expect(serialized_state).to.deep.equal(state);
        });
    });

    describe('serialize null values', function() {
        it('exists', function() {
        const state_with_null = {
            a: 5,
            b: null
        };
        const serialized_state = this.widget.serialize(state_with_null);
        expect(serialized_state).to.be.an('object');
        expect(serialized_state).to.deep.equal(state_with_null);
        });
    });

    describe('serialize with custom serializers', function() {
        it('exists', function() {
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
        it('exists', function() {
        expect(this.widget._handle_comm_msg).to.not.be.undefined;

        // Update message
        let setStateSpy = sinon.spy(this.widget, "set_state");
        this.widget._handle_comm_msg({content: {data: {method: 'update'}}});
        let p1 = this.widget.state_change = this.widget.state_change.then(() => {
            expect(setStateSpy.calledOnce).to.be.true;
        });

        // Custom message
        let customEventCallback = sinon.spy();
        this.widget.on('msg:custom', customEventCallback);
        this.widget._handle_comm_msg({content: {data: {method: 'custom'}}});
        expect(customEventCallback.calledOnce).to.be.true; // Triggered synchronously

        return p1;
        });
    });

    describe('set_state', function() {
        it('sets the state of the widget', function() {
            expect(this.widget.get('a')).to.be.undefined;
            this.widget.set_state({a: 2});
            expect(this.widget.get('a')).to.equal(2);
        });
    });

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
