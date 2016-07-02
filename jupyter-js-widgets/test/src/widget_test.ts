import {
    DummyManager
} from './dummy-manager';

import expect = require('expect.js');
import sinon = require('sinon');

describe("Widget", function() {
    beforeEach(function() {
        this.manager = new DummyManager();
        this.modelId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        return this.manager.new_widget({
            model_module: 'jupyter-js-widgets',
            model_name: 'WidgetModel',
            model_id: this.modelId,
            widget_class: 'ipywidgets.Widget'
        }).then(model => {
            this.widget = model;
        }).catch(err => {
            console.error('Could not create widget', Error.prototype.toString.call(err));
            if (err.stack) {
              console.error('  Trace:', err.stack);
            }
            if (err.error_stack) {
              err.error_stack.forEach((subErr, i) => console.error(`  Chain[${i}]:`, Error.prototype.toString.call(subErr)));
            }
        });
    });

    it('construction', function() {
        expect(this.manager).to.not.be(void 0);
        expect(this.widget).to.not.be(void 0);
    });

    it('widget_manager', function() {
        expect(this.widget.widget_manager).to.equal(this.manager);
    });

    it('state_change', function() {
        expect(this.widget.state_change).to.not.be(void 0);
        expect(this.widget.state_change).to.be.a(Promise);
    });

    it('pending_msgs', function() {
        expect(this.widget.pending_msgs).to.not.be(void 0);
        expect(this.widget.pending_msgs).to.equal(0);
    });

    it('msg_buffer', function() {
        expect(this.widget.msg_buffer).to.not.be(void 0);
        expect(this.widget.msg_buffer).to.be(null);
    });

    it('state_lock', function() {
        expect(this.widget.state_lock).to.not.be(void 0);
        expect(this.widget.state_lock).to.be(null);
    });

    it('id', function() {
        expect(this.widget.id).to.not.be(void 0);
        expect(this.widget.id).to.be.a('string');
        expect(this.widget.id).to.equal(this.modelId);
    });

    it('views', function() {
        expect(this.widget.views).to.not.be(void 0);
        expect(this.widget.views).to.be.an('object');
    });

    it('comm', function() {
        expect(this.widget.comm).to.not.be(void 0);
    });

    it('comm_live', function() {
        expect(this.widget.comm_live).to.not.be(void 0);
        expect(this.widget.comm_live).to.be(true);
    });

    it('send', function() {
        expect(this.widget.send).to.not.be(void 0);

        // TODO: Test pending message buffer for comm-full widgets
        // let p = this.widget.pending_msgs;
        // this.widget.send({}, {});
        // expect(this.widget.pending_msgs).to.equal(p + 1);
    });

    it('close', function() {
        expect(this.widget.close).to.not.be(void 0);

        let destroyEventCallback = sinon.spy();
        this.widget.on('destroy', destroyEventCallback);

        this.widget.close();
        expect(destroyEventCallback.calledOnce).to.be(true);
        expect(this.widget.comm).to.be(void 0);
        expect(this.widget.model_id).to.be(void 0);
        expect(Object.keys(this.widget.views).length).to.be.equal(0);
    });

    it('_handle_comm_closed', function() {
        expect(this.widget._handle_comm_closed).to.not.be(void 0);

        let closeSpy = sinon.spy(this.widget, "close");
        let closeEventCallback = sinon.spy();
        this.widget.on('comm:close', closeEventCallback);

        this.widget._handle_comm_closed({});
        expect(closeEventCallback.calledOnce).to.be(true);
        expect(closeSpy.calledOnce).to.be(true);
    });

    it('_deserialize_state', function() {
        expect(this.widget.constructor._deserialize_state).to.not.be(void 0);

        // Create some dummy deserializers.  One returns synchronously, and the
        // other asynchronously using a promise.
        this.widget.constructor.serializers = {
            a: {
                deserialize: (value, widget) => {
                    return value*3.0;
                }
            },
            b: {
                deserialize: (value, widget) => {
                    return Promise.resolve(value/2.0);
                }
            }
        };

        let deserialized = this.widget.constructor._deserialize_state({ a: 2.0, b: 2.0, c: 2.0 });
        expect(deserialized).to.be.a(Promise);
        return deserialized.then(state => {
            expect(state.a).to.equal(6.0);
            expect(state.b).to.equal(1.0);
            expect(state.c).to.equal(2.0);
        });
    });

    it('_handle_comm_msg', function() {
        expect(this.widget._handle_comm_msg).to.not.be(void 0);

        // Update message
        let setStateSpy = sinon.spy(this.widget, "set_state");
        this.widget._handle_comm_msg({content: {data: {method: 'update'}}});
        let p1 = this.widget.state_change = this.widget.state_change.then(() => {
            expect(setStateSpy.calledOnce).to.be(true);
        });

        // Custom message
        let customEventCallback = sinon.spy();
        this.widget.on('msg:custom', customEventCallback);
        this.widget._handle_comm_msg({content: {data: {method: 'custom'}}});
        expect(customEventCallback.calledOnce).to.be(true); // Triggered synchronously

        // Display message
        let displaySpy = sinon.spy(this.manager, "display_model");
        this.widget._handle_comm_msg({content: {data: {method: 'display'}}});
        let p2 = this.widget.state_change = this.widget.state_change.then(() => {
            expect(displaySpy.calledOnce).to.be(true);
        });

        return Promise.all([p1, p2]);
    });

    it('set_state', function() {
        expect(this.widget.set_state).to.not.be(void 0);
        expect(this.widget.get('a')).to.be(void 0);
        this.widget.set_state({a: 2});
        expect(this.widget.get('a')).to.equal(2);
    });

    it('get_state', function() {
        expect(this.widget.get_state).to.not.be(void 0);
        expect(this.widget.get_state.bind(this)).to.not.throwException();
    });

    it('_handle_status', function() {
        expect(this.widget._handle_status).to.not.be(void 0);
    });

    it('callbacks', function() {
        expect(this.widget.callbacks).to.not.be(void 0);

        let c = this.widget.callbacks();
        expect(c).to.be.an('object');
        expect(c.iopub).to.be.an('object');
        expect(c.iopub.status).to.be.a('function');

        let statusSpy = sinon.spy(this.widget, "_handle_status");
        c.iopub.status({content: {data: {}}});
        expect(statusSpy.calledOnce).to.be(true);
    });

    it('set', function() {
        expect(this.widget.set).to.not.be(void 0);
    });

    it('sync', function() {
        expect(this.widget.sync).to.not.be(void 0);
    });

    it('send_sync_message', function() {
        expect(this.widget.send_sync_message).to.not.be(void 0);
    });

    it('save_changes', function() {
        expect(this.widget.save_changes).to.not.be(void 0);
    });

    it('on_some_change', function() {
        expect(this.widget.on_some_change).to.not.be(void 0);

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
            expect(someChangeCallback.calledOnce).to.be(true);
        });
    });

    it('toJSON', function() {
        expect(this.widget.toJSON).to.not.be(void 0);
        expect(this.widget.toJSON()).to.be.a('string');
    });
});
