// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as managerBase from './manager-base';
import * as Backbone from 'backbone';
import * as _ from 'underscore';
import * as utils from './utils';
import * as $ from 'jquery';

import {
    NativeView
} from './nativeview';

import {
    Widget
} from '@phosphor/widgets';

import {
    Message, MessageLoop
} from '@phosphor/messaging';


/**
 * Replace model ids with models recursively.
 */
export
function unpack_models(value, manager) {
    var unpacked;
    if (_.isArray(value)) {
        unpacked = [];
        _.each(value, (sub_value, key) => {
            unpacked.push(unpack_models(sub_value, manager));
        });
        return Promise.all(unpacked);
    } else if (value instanceof Object) {
        unpacked = {};
        _.each(value, (sub_value, key) => {
            unpacked[key] = unpack_models(sub_value, manager);
        });
        return utils.resolvePromisesDict(unpacked);
    } else if (typeof value === 'string' && value.slice(0,10) === 'IPY_MODEL_') {
        // get_model returns a promise already
        return manager.get_model(value.slice(10, value.length));
    } else {
        return Promise.resolve(value);
    }
};

export
class WidgetModel extends Backbone.Model {

    /**
     * The default attributes.
     */
    defaults() {
        return {
            _model_module: "jupyter-js-widgets",
            _model_name: "WidgetModel",
            _model_module_version: "*",
            _view_module: "jupyter-js-widgets",
            _view_name: null,
            _view_module_version: "*",
            msg_throttle: 1,
        };
    }

    /**
     * Test to see if the model has been synced with the server.
     *
     * #### Notes
     * As of backbone 1.1, backbone ignores `patch` if it thinks the
     * model has never been pushed.
     */
    isNew() {
        return false;
    }

    /**
     * Constructor
     *
     * Creates a WidgetModel instance.
     *
     * Parameters
     * ----------
     * widget_manager : WidgetManager instance
     * model_id : string
     *      An ID unique to this model.
     * comm : Comm instance (optional)
     */
    initialize(attributes, options) {
        super.initialize(attributes, options);

        this.widget_manager = options.widget_manager;
        this.id = options.model_id;
        let comm = options.comm;

        this.state_change = Promise.resolve();
        this.pending_msgs = 0;
        this.msg_buffer = null;
        this.state_lock = null;
        this._buffered_state_diff = {};


        this.views = {};

        if (comm) {
            // Remember comm associated with the model.
            this.comm = comm;
            comm.model = this;

            // Hook comm messages up to model.
            comm.on_close(_.bind(this._handle_comm_closed, this));
            comm.on_msg(_.bind(this._handle_comm_msg, this));

            this.comm_live = true;
        } else {
            this.comm_live = false;
        }
    }

    /**
     * Send a custom msg over the comm.
     */
    send(content, callbacks, buffers?) {
        if (this.comm !== undefined) {
            var data = {method: 'custom', content: content};
            this.comm.send(data, callbacks, {}, buffers);
            this.pending_msgs++;
        }
    }

    /**
     * Close model
     */
    close(comm_closed) {
        if (this.comm && !comm_closed) {
            this.comm.close();
        }
        this.stopListening();
        this.trigger('destroy', this);
        if (this.comm) {
            delete this.comm.model; // Delete ref so GC will collect widget model.
            delete this.comm;
        }
        delete this.model_id; // Delete id from model so widget manager cleans up.
        _.each(this.views, (v: Promise<any>, id, views) => {
            v.then((view) => {
                view.remove();
                delete views[id];
            });
        });
    }

    /**
     * Handle when a widget is closed.
     */
    _handle_comm_closed(msg) {
        this.trigger('comm:close');
        this.close(true);
    }

    /**
     * Handle incoming comm msg.
     */
    _handle_comm_msg(msg) {
        var method = msg.content.data.method;
        switch (method) {
            case 'update':
                this.state_change = this.state_change
                    .then(() => {
                        // see Widget.open/_split_state_buffers about why we need state_with_buffers
                        var state = msg.content.data.state;
                        var buffer_paths = msg.content.data.buffer_paths || [];
                        var buffers = msg.buffers || [];
                        utils.put_buffers(state, buffer_paths, buffers);
                        return (this.constructor as typeof WidgetModel)._deserialize_state(state, this.widget_manager);
                    }).then((state) => {
                        this.set_state(state);
                    }).catch(utils.reject('Could not process update msg for model id: ' + String(this.id), true))
                return this.state_change;
            case 'custom':
                this.trigger('msg:custom', msg.content.data.content, msg.buffers);
                return Promise.resolve();
            case 'display':
                if (this.widget_manager.displayWithOutput) {
                    return;
                }
                this.state_change = this.state_change.then(() => {
                    this.widget_manager.display_model(msg, this);
                }).catch(utils.reject('Could not process display view msg', true));
                return this.state_change;
        }
    }

    /**
     * Handle when a widget is updated from the backend.
     */
    set_state(state: any) {
        this.state_lock = state;
        try {
            this.set(state);
        } catch(e) {
            console.error('Error setting state:', e.message);
        } finally {
            this.state_lock = null;
        }
    }

    /**
     * Get the serializable state of the model.
     *
     * If drop_default is thruthy, attributes that are equal to their default
     * values are dropped.
     */
    get_state(drop_defaults) {
        var state = this.attributes;
        if (drop_defaults) {
            var defaults = _.result(this, 'defaults');
            return Object.keys(state).reduce((obj, key) => {
                if (!_.isEqual(state[key], defaults[key])) {
                    obj[key] = state[key];
                }
                return obj;
            }, {});
        } else {
            return _.clone(state);
        }
    }

    /**
     * Handle status msgs.
     *
     * execution_state : ('busy', 'idle', 'starting')
     */
    _handle_status(msg, callbacks) {
        if (this.comm !== undefined) {
            if (msg.content.execution_state ==='idle') {
                // Send buffer if this message caused another message to be
                // throttled.
                // TODO: make sure this is handled just like the original syncing.
                // Right now, it doesn't take into account the new binary_paths key
                if (this.msg_buffer !== null &&
                    (this.get('msg_throttle') || 1) === this.pending_msgs) {
                    var data = {
                        method: 'update',
                        state: this.msg_buffer
                    };
                    this.comm.send(data, callbacks);
                    this.msg_buffer = null;
                } else {
                    --this.pending_msgs;
                }
            }
        }
    }

    /**
     * Create msg callbacks for a comm msg.
     */
    callbacks(view?) {
        let callbacks = this.widget_manager.callbacks(view);

        if (callbacks.iopub === undefined) {
            callbacks.iopub = {};
        }

        callbacks.iopub.status = (msg) => {
            this._handle_status(msg, callbacks);
        };
        return callbacks;
    }

    /**
     * Set a value.
     *
     * We just call the super method, in which val and options are optional
     */
    set(key, val?, options?) {
        var return_value = super.set(key, val, options);

        // Backbone only remembers the diff of the most recent set()
        // operation.  Calling set multiple times in a row results in a
        // loss of diff information.  Here we keep our own running diff.
        //
        // We don't buffer the state set in the constructor (including
        // defaults), so we first check to see if we've initialized _buffered_state_diff.
        // which happens after the constructor sets attributes at creation.
        if (this._buffered_state_diff !== void 0) {
            this._buffered_state_diff = _.extend(this._buffered_state_diff, this.changedAttributes() || {});
        }
        return return_value;
    }

    /**
     * Handle sync to the back-end.  Called when a model.save() is called.
     *
     * Make sure a comm exists.
     *
     * Parameters
     * ----------
     * method : create, update, patch, delete, read
     *   create/update always send the full attribute set
     *   patch - only send attributes listed in options.attrs, and if we
     *   are queuing up messages, combine with previous messages that have
     *   not been sent yet
     * model : the model we are syncing
     *   will normally be the same as `this`
     * options : dict
     *   the `attrs` key, if it exists, gives an {attr: value} dict that
     *   should be synced, otherwise, sync all attributes.
     *
     */
    sync(method, model, options: any = {}): any {
        // the typing is to return `any` since the super.sync method returns a JqXHR, but we just return false if there is an error.
        var error = options.error || function() {
            console.error('Backbone sync error:', arguments);
        };
        if (this.comm === undefined) {
            error();
            return false;
        }

        var attrs = (method === 'patch') ? options.attrs : model.get_state(options.drop_defaults);

        // The state_lock lists attributes that are currently being changed
        // right now from a kernel message.
        // We don't want to send these non-changes back to the kernel, so we
        // delete them out of attrs, (but we only delete them if the value
        // hasn't changed from the value stored in the state_lock).
        if (this.state_lock !== null) {
            var keys = Object.keys(this.state_lock);
            for (var i=0; i<keys.length; i++) {
                var key = keys[i];
                if (attrs[key] === this.state_lock[key]) {
                    delete attrs[key];
                }
            }
        }

        if (_.size(attrs) > 0) {

            // If this message was sent via backbone itself, it will not
            // have any callbacks.  It's important that we create callbacks
            // so we can listen for status messages, etc...
            var callbacks = options.callbacks || this.callbacks();

            // Check throttle.
            if (this.pending_msgs >= (this.get('msg_throttle') || 1)) {
                // The throttle has been exceeded, buffer the current msg so
                // it can be sent once the kernel has finished processing
                // some of the existing messages.
                // Combine updates if it is a 'patch' sync, otherwise replace updates
                switch (method) {
                    case 'patch':
                        this.msg_buffer = _.extend(this.msg_buffer || {}, attrs);
                        break;
                    case 'update':
                    case 'create':
                        this.msg_buffer = attrs;
                        break;
                    default:
                        error();
                        return false;
                }
                this.msg_buffer_callbacks = callbacks;

            } else {
                // We haven't exceeded the throttle, send the message like
                // normal.
                this.send_sync_message(attrs, callbacks);
                this.pending_msgs++;
                // Since the comm is a one-way communication, assume the message
                // arrived and was processed successfully.
                // Don't call options.success since we don't have a model back from
                // the server. Note that this means we don't have the Backbone
                // 'sync' event.

            }
        }
    }

    send_sync_message(attrs, callbacks) {
        // prepare and send a comm message syncing attrs
        // first, build a state dictionary with key=the attribute and the value
        // being the value or the promise of the serialized value
        var serializers = (this.constructor as typeof WidgetModel).serializers;
        if (serializers) {
            for (var k in attrs) {
                if (serializers[k] && serializers[k].serialize) {
                    attrs[k] = (serializers[k].serialize)(attrs[k], this);
                }
            }
        }
        utils.resolvePromisesDict(attrs).then((state) => {
            // get binary values, then send
            var keys = Object.keys(state);
            // this function goes through lists and object and removes arraybuffers
            // they will be transferred separately, since they don't json'ify
            // on the python side the inverse happens
            var split = utils.remove_buffers(state);
            this.comm.send({
                method: 'update',
                state: split.state,
                buffer_paths: split.buffer_paths
            }, callbacks, {}, split.buffers);
        }).catch((error) => {
            this.pending_msgs--;
            return (utils.reject('Could not send widget sync message', true))(error);
        });
    }

    /**
     * Push this model's state to the back-end
     *
     * This invokes a Backbone.Sync.
     */
    save_changes(callbacks?) {
        if (this.comm_live) {
            let options: any = {patch: true}
            if (callbacks) {
                options.callbacks = callbacks;
            }
            this.save(this._buffered_state_diff, options);
            this._buffered_state_diff = {};
        }
    }

    /**
     * on_some_change(['key1', 'key2'], foo, context) differs from
     * on('change:key1 change:key2', foo, context).
     * If the widget attributes key1 and key2 are both modified,
     * the second form will result in foo being called twice
     * while the first will call foo only once.
     */
    on_some_change(keys, callback, context) {
        this.on('change', function() {
            if (keys.some(this.hasChanged, this)) {
                callback.apply(context, arguments);
            }
        }, this);
    }

    /**
     * Serialize the model.  See the deserialization function at the top of this file
     * and the kernel-side serializer/deserializer.
     */
    toJSON(options) {
        return 'IPY_MODEL_' + this.id;
    }

    /**
     * Returns a promise for the deserialized state. The second argument
     * is an instance of widget manager, which is required for the
     * deserialization of widget models.
     */
    static _deserialize_state(state, manager) {
        var serializers = this.serializers;
        var deserialized;
        if (serializers) {
            deserialized = {};
            for (var k in state) {
                if (serializers[k] && serializers[k].deserialize) {
                     deserialized[k] = (serializers[k].deserialize)(state[k], manager);
                } else {
                     deserialized[k] = state[k];
                }
            }
        } else {
            deserialized = state;
        }
        return utils.resolvePromisesDict(deserialized);
    }

    /**
     * Returns a promise for the serialized state. The second argument
     * is an instance of widget manager.
     */
    static _serialize_state(state, manager) {
        var serializers = this.serializers;
        var serialized;
        if (serializers) {
            serialized = {};
            for (var k in state) {
                if (serializers[k] && serializers[k].serialize) {
                     serialized[k] = (serializers[k].serialize)(state[k], manager);
                } else {
                     serialized[k] = state[k];
                }
            }
        } else {
            serialized = state;
        }
        return utils.resolvePromisesDict(serialized);
    }

    static serializers: any;
    widget_manager: any;
    state_change: any
    _buffered_state_diff: any;
    pending_msgs: any;
    msg_buffer: any;
    state_lock: any;
    views: any;
    comm: any;
    comm_live: boolean;
    model_id: string;
    msg_buffer_callbacks: any;
}

export
class DOMWidgetModel extends WidgetModel {
    static serializers = _.extend({
        layout: {deserialize: unpack_models},
        style: {deserialize: unpack_models},
    }, WidgetModel.serializers)

    defaults() {
        return _.extend(super.defaults(), {
            layout: void 0,
            _dom_classes: []
        });
    }
}

/**
 * - create_view and remove_view are default functions called when adding or removing views
 * - create_view takes a model and an index and returns a view or a promise for a view for that model
 * - remove_view takes a view and destroys it (including calling `view.remove()`)
 * - each time the update() function is called with a new list, the create and remove
 *   callbacks will be called in an order so that if you append the views created in the
 *   create callback and remove the views in the remove callback, you will duplicate
 *   the order of the list.
 * - the remove callback defaults to just removing the view (e.g., pass in null for the second parameter)
 * - the context defaults to the created ViewList.  If you pass another context, the create and remove
 *   will be called in that context.
 */
export
class ViewList<T> {
    constructor(create_view: (model: any, index: any) => T | Promise<T>, remove_view: (view: T) => void, context) {
        this.initialize(create_view, remove_view, context);
    }

    initialize(create_view: (model: any, index: any) => T | Promise<T>, remove_view: (view: T) => void, context) {
        this._handler_context = context || this;
        this._models = [];
        this.views = []; // list of promises for views
        this._create_view = create_view;
        this._remove_view = remove_view || function(view) {(view as any).remove();};
    }

    /**
     * the create_view, remove_view, and context arguments override the defaults
     * specified when the list is created.
     * after this function, the .views attribute is a list of promises for views
     * if you want to perform some action on the list of views, do something like
     * `Promise.all(myviewlist.views).then(function(views) {...});`
     */
    update(new_models, create_view?: (model: any, index: any) => T | Promise<T>, remove_view?: (view: T) => void, context?): Promise<T[]> {
        let remove = remove_view || this._remove_view;
        let create = create_view || this._create_view;
        context = context || this._handler_context;
        let i = 0;
        // first, skip past the beginning of the lists if they are identical
        for (; i < new_models.length; i++) {
            if (i >= this._models.length || new_models[i] !== this._models[i]) {
                break;
            }
        }
        let first_removed = i;
        // Remove the non-matching items from the old list.
        let removed = this.views.splice(first_removed, this.views.length-first_removed);
        for (let j = 0; j < removed.length; j++) {
            removed[j].then(function(view) {
                remove.call(context, view);
            });
        }

        // Add the rest of the new list items.
        for (; i < new_models.length; i++) {
            this.views.push(Promise.resolve(create.call(context, new_models[i], i)));
        }
        // make a copy of the input array
        this._models = new_models.slice();
        // return a promise that resolves to all of the resolved views
        return Promise.all(this.views);
    }

    /**
     * removes every view in the list; convenience function for `.update([])`
     * that should be faster
     * returns a promise that resolves after this removal is done
     */
    remove(): Promise<void> {
        return Promise.all(this.views).then((views) => {
            views.forEach((value) => this._remove_view.call(this._handler_context, value));
            this.views = [];
            this._models = [];
        });
    }

    /**
     * Dispose this viewlist.
     *
     * A synchronous function which just deletes references to child views. This
     * function does not call .remove() on child views because that is
     * asynchronous. Use this in cases where child views will be removed in
     * another way.
     */
    dispose(): void {
        this.views = null;
        this._models = null;
    }

    _handler_context: any;
    _models: any[];
    views: Promise<T>[];
    _create_view: (model: any, index: any) => T | Promise<T>;
    _remove_view: (view: T) => void;
}


export
abstract class WidgetView extends NativeView<WidgetModel> {
    /**
     * Public constructor.
     */
    initialize(parameters) {
        this.listenTo(this.model, 'change', this.update);

        this.options = parameters.options;
        this.displayed = new Promise((resolve, reject) => {
            this.once('displayed', resolve);
        });
    }

    /**
     * Triggered on model change.
     *
     * Update view to be consistent with this.model
     */
    update(options?) {
    };

    /**
     * Render a view
     *
     * @returns the view or a promise to the view.
     */
    render(): any {
    }

    /**
     * Create and promise that resolves to a child view of a given model
     */
    create_child_view(child_model, options?) {
        var that = this;
        options = _.extend({ parent: this }, options || {});
        return this.model.widget_manager.create_view(child_model, options)
            .catch(utils.reject('Could not create child view', true));
    }

    /**
     * Create msg callbacks for a comm msg.
     */
    callbacks() {
        return this.model.callbacks(this);
    }

    /**
     * Send a custom msg associated with this view.
     */
    send(content, buffers?) {
        this.model.send(content, this.callbacks(), buffers);
    }

    touch() {
        this.model.save_changes(this.callbacks());
    }

    remove(): any {
        // Raise a remove event when the view is removed.
        super.remove();
        this.trigger('remove');
        return this;
    }

    options: any;

    /**
     * A promise that resolves to the parent view when a child view is displayed.
     */
    displayed: Promise<WidgetView>;
}

export
namespace JupyterPhosphorWidget {
    export
    interface IOptions {
        view: DOMWidgetView;
    }
}

export
class JupyterPhosphorWidget extends Widget {
    constructor(options: Widget.IOptions & JupyterPhosphorWidget.IOptions) {
        let view = options.view;
        delete options.view;
        super(options);
        this._view = view;
    }

    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    }

    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    processMessage(msg: Message) {
        super.processMessage(msg);
        this._view.processPhosphorMessage(msg);
    }

    private _view: DOMWidgetView;
}

export
class DOMWidgetView extends WidgetView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.id = utils.uuid();

        this.listenTo(this.model, 'change:_dom_classes', (model, new_classes) => {
            var old_classes = model.previous('_dom_classes');
            this.update_classes(old_classes, new_classes);
        });

        this.layoutPromise = Promise.resolve();
        this.listenTo(this.model, 'change:layout', (model, value) => {
            this.setLayout(value, model.previous('layout'));
        });

        this.stylePromise = Promise.resolve();
        this.listenTo(this.model, 'change:style', (model, value) => {
            this.setStyle(value, model.previous('style'));
        });

        this.displayed.then(() => {
            this.update_classes([], this.model.get('_dom_classes'));
            this.setLayout(this.model.get('layout'));
            this.setStyle(this.model.get('style'));
        });
    }

    setLayout(layout, oldLayout?) {
        if (layout) {
            this.layoutPromise = this.layoutPromise.then((oldLayoutView) => {
                if (oldLayoutView) {
                    oldLayoutView.unlayout();
                    this.stopListening(oldLayoutView.model);
                    oldLayoutView.remove();
                }

                return this.create_child_view(layout).then((view) => {
                    // Trigger the displayed event of the child view.
                    return this.displayed.then(() => {
                        view.trigger('displayed');
                        this.listenTo(view.model, 'change', () => {
                            // Post (asynchronous) so layout changes can take
                            // effect first.
                            MessageLoop.postMessage(this.pWidget, Widget.ResizeMessage.UnknownSize);
                        });
                        MessageLoop.postMessage(this.pWidget, Widget.ResizeMessage.UnknownSize);
                        return view;
                    });
                }).catch(utils.reject('Could not add LayoutView to DOMWidgetView', true));
            });
        }
    }

    setStyle(style, oldStyle?) {
        if (style) {
            this.stylePromise = this.stylePromise.then((oldStyleView) => {
                if (oldStyleView) {
                    oldStyleView.unstyle();
                    this.stopListening(oldStyleView.model);
                    oldStyleView.remove();
                }

                return this.create_child_view(style).then((view) => {
                    // Trigger the displayed event of the child view.
                    return this.displayed.then(() => {
                        view.trigger('displayed');
                        // Unlike for the layout attribute, style changes don't
                        // trigger phosphor resize messages.
                        return view;
                    });
                }).catch(utils.reject('Could not add styleView to DOMWidgetView', true));
            });
        }
    }

    /**
     * Update the DOM classes applied to an element, default to this.el.
     */
    update_classes(old_classes, new_classes, el?) {
        if (el===undefined) {
            el = this.el;
        }
        _.difference(old_classes, new_classes).map(function(c) {
            if (el.classList) { // classList is not supported by IE for svg elements
                el.classList.remove(c);
            } else {
                el.setAttribute('class', el.getAttribute('class').replace(c, ''));
            }
        });
        _.difference(new_classes, old_classes).map(function(c) {
            if (el.classList) { // classList is not supported by IE for svg elements
                el.classList.add(c);
            } else {
                el.setAttribute('class', el.getAttribute('class').concat(' ', c));
            }
        });
    }

    /**
     * Update the DOM classes applied to the widget based on a single
     * trait's value.
     *
     * Given a trait value classes map, this function automatically
     * handles applying the appropriate classes to the widget element
     * and removing classes that are no longer valid.
     *
     * Parameters
     * ----------
     * class_map: dictionary
     *  Dictionary of trait values to class lists.
     *  Example:
     *      {
     *          success: ['alert', 'alert-success'],
     *          info: ['alert', 'alert-info'],
     *          warning: ['alert', 'alert-warning'],
     *          danger: ['alert', 'alert-danger']
     *      };
     * trait_name: string
     *  Name of the trait to check the value of.
     * el: optional DOM element handle, defaults to this.el
     *  Element that the classes are applied to.
     */
    update_mapped_classes(class_map, trait_name, el?) {
        var key = this.model.previous(trait_name);
        var old_classes = class_map[key] ? class_map[key] : [];
        key = this.model.get(trait_name);
        var new_classes = class_map[key] ? class_map[key] : [];

        this.update_classes(old_classes, new_classes, el || this.el);
    }

    set_mapped_classes(class_map, trait_name, el?) {
        var key = this.model.get(trait_name);
        var new_classes = class_map[key] ? class_map[key] : [];
        this.update_classes([], new_classes, el || this.el);
    }

    typeset(element, text?){
        this.displayed.then(function() {utils.typeset(element, text);});
    }

    _setElement(el: HTMLElement) {
        if (this.pWidget) {
            this.pWidget.dispose();
        }

        this.$el = el instanceof $ ? el : $(el);
        this.el = this.$el[0];
        this.pWidget = new JupyterPhosphorWidget({
            node: el,
            view: this
        });
    }

    remove() {
        if (this.pWidget) {
            this.pWidget.dispose();
        }
        return super.remove();
    }

    processPhosphorMessage(msg: Message) {
        switch (msg.type) {
        case 'after-attach':
            this.trigger('displayed');
            break;
        }
    }

    '$el': any;
    pWidget: Widget;
    layoutPromise: Promise<any>;
    stylePromise: Promise<any>;
}


export
class LabeledDOMWidgetModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            description: '',
        });
    }
}

export
class LabeledDOMWidgetView extends DOMWidgetView {

    render() {
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listenTo(this.model, 'change:description', this.updateDescription);
        this.updateDescription();
    }

    updateDescription() {
        let description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.label.innerHTML = description;
            this.typeset(this.label);
            this.label.style.display = '';
        }
        this.label.title = description;
    }

    label: HTMLDivElement;
}
