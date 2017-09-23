import {
    WidgetModel, WidgetView, DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

let common_event_message_names = [
    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',
    'type',
    'timeStamp'
]

let mouse_standard_event_message_names = [
    'button',
    'buttons',
    'clientX',
    'clientY',
    'layerX',
    'layerY',
    'movementX',
    'movementY',
    'offsetX',
    'offsetY',
    'pageX',
    'pageY',
    'screenX',
    'screenY',
    'x',
    'y',
    'arrayX',
    'arrayY'
]

let key_standard_event_names = [
    'code',
    'key',
    'location',
    'repeat'
]

function dom_click(generating_view, event) {
    //     if (generating_view.model.get('_view_name') == 'ImageView') {
    if ('_foo' in generating_view) {
        console.log("Hey, nice Image!")
        let array_coords = generating_view['_foo'](event)
        event['arrayX'] = array_coords.x
        event['arrayY'] = array_coords.y
    }
    this._send_dom_event(event)
}


export
class MouseListenerModel extends WidgetModel {
    static serializers = {
        ...WidgetModel.serializers,
        source: {deserialize: unpack_models}
    }

    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MouseListenerModel',
            source: null,
            watched_events: [],
            _attached_listeners: [],
            _known_views: [],
            _supported_mouse_events: [],
            _supported_key_events: []
            });
    }

    initialize(attributes, options: {model_id: string, comm?: any, widget_manager: any}) {
        super.initialize(attributes, options);
        this.on('change:source', this.update_listeners, this)
        this.on('change:watched_events', this.update_listeners, this)
    }

    key_or_mouse(event_type) {
        if (_.contains(this.get('_supported_mouse_events'), event_type)) {
            return 'mouse'
        }
        if (_.contains(this.get('_supported_key_events'), event_type)) {
            return 'keyboard'
        }
    }

    _cache_listeners(event_type, view, handler) {
        // Build up a cache of listeners so they can be removed if the
        // listener changes source or watched events.
        this.get('_attached_listeners').push({
            event: event_type,
            view: view,
            func: handler,
        })
    }

    update_listeners() {
        // Remove all existing DOM event listeners
        this.remove_listeners()
        // Add watchers to any existing views of the model
        this.attach_listeners()
    }

    remove_listeners() {
        // Remove all of the event listeners stored in the cache.
        for (let listener of this.get('_attached_listeners')) {
            console.log('Removing ', listener.event, ' from ', listener.view, 'function', listener.func)
            listener.view.el.removeEventListener(listener.event, listener.func)
        }
        this.set('_attached_listeners', [])
    }

    _add_listener_to_view(view) {
        for (let event of this.get('watched_events')) {
            switch (this.key_or_mouse(event)) {
                case "keyboard":
                    this.add_key_listener(event, view)
                    break
                case "mouse":
                    let handler = dom_click.bind(this, view)
                    view.el.addEventListener(event, handler)
                    // Keep track of the listeners we are attaching so that we can
                    // remove them if needed.
                    this._cache_listeners(event, view, handler)
                    break
                default:
                    console.log('Not familiar with that message source')
                    break
            }
        }
    }

    attach_listeners() {
        // console.log("Attaching listeners")
        let current_source = this.get('source')
        _.each(current_source.views, (view_promise) => {
            Promise.resolve(view_promise).then((view) => {
                this._add_listener_to_view(view)
                this.get('_known_views').push(view)
            })
        })
    }

    add_key_listener(event_type, view) {
        // Key listeners should:
        //     + Only fire when the mouse is over the element.
        //     + Not propagate up to the notebook (because imagine you
        //       press 'x' on your widget and cut the cell...not what
        //       you probably want the user to experience)
        //
        // The approach here is to add a key listener on mouseenter and remove
        // it on mouseleave.
        let key_handler = (event) => {
            // console.log('Key presses FTW!', event)
            this._send_dom_event(event)
            // Need this (and useCapture in the listener) to prevent the keypress
            // from propagating to the notebook.
            event.stopPropagation()
            //_.bind(this.keyboard_fake, this)
        }
        // Last argument useCapture needs to be true to prevent the event from
        // passing through to the notebook; also need to stopPropagation in key_handler.
        let capture_event = true
        let enable_key_listen = () => {document.addEventListener(event_type, key_handler, capture_event)}
        let disable_key_listen = () => {document.removeEventListener(event_type, key_handler, capture_event)}
        view.el.addEventListener('mouseenter', enable_key_listen)
        view.el.addEventListener('mouseleave', disable_key_listen)
        this._cache_listeners('mouseenter', view, enable_key_listen)
        this._cache_listeners('mouseleave', view, disable_key_listen)
    }

    _send_dom_event(event) {
        // Construct the event message. The message is a dictionary, with keys
        // determined by the type of event from the list of event names above.
        //
        // Values are drawn from the DOM event object.
        let event_message = {}
        let message_names = []
        console.log(event.type, event)
        switch (this.key_or_mouse(event.type)) {
            case "mouse":
                message_names = common_event_message_names.concat(mouse_standard_event_message_names)
                break;
            case "keyboard":
                message_names = common_event_message_names.concat(key_standard_event_names)
                break;
            default:
                console.log('Not familiar with that message source')
                break;
        }

        for (let i of message_names) {
            event_message[i] = event[i]
            if (event[i] == undefined) {
                //console.log('    No ', i)
            }
        }
        event_message['event'] = event['type']
        this.send(event_message, {})
    }
}

