import {
    WidgetModel, WidgetView, DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

// The names in the lists below are what will be sent as part of the
// event message to the backend.
// The actual list is constructed in _send_dom_message

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
    'y'
]

let mouse_added_event_message_names = [
    'arrayX',
    'arrayY',
    'relativeX',
    'relativeY'
]

let wheel_standard_event_names = [
    'deltaX',
    'deltaY',
    'deltaZ',
    'deltaMode'
]

let drag_standard_event_names = [
    'dataTransfer'
]

let key_standard_event_names = [
    'code',
    'key',
    'location',
    'repeat'
]

function _get_position(view, event) {
    // Return something like the position relative to the element to which
    // the listener is attached. This is essentially what layerX and layerY
    // are supposed to be (and are in chrome) but those event properties have
    // red box warnings in the MDN documentation that they are not part of any
    // standard and are not on any standards tracks, so get what we need here.
    var bounding_rect = view.el.getBoundingClientRect();
    var y_offset = bounding_rect.top;
    var x_offset = bounding_rect.left;
    return {
        'x': Math.round(event.clientX - x_offset),
        'y': Math.round(event.clientY - y_offset)
    }
}

export
class DOMListenerModel extends WidgetModel {
    static serializers = {
        ...WidgetModel.serializers,
        source: {deserialize: unpack_models}
    }

    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'DOMListenerModel',
            source: null,
            watched_events: [],
            ignore_modifier_key_events: false,
            prevent_default_action: false,
            _attached_listeners: [],
            _supported_mouse_events: [],
            _supported_key_events: [],
            _modifier_keys: ['Shift', 'Control', 'Alt', 'Meta']
        });
    }

    initialize(attributes, options: {model_id: string, comm?: any, widget_manager: any}) {
        super.initialize(attributes, options);
        this.on('change:source', this.prepare_source, this)
        this.on('change:watched_events', this.update_listeners, this)
        this.prepare_source()
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

    prepare_source() {
        // Watch for changes in the models _view_count, and update
        // DOM listeners when views are created or destroyed.
        let previous_model = this.previous('source')
        this.stopListening(previous_model)

        let current_model = this.get('source')
        if (current_model.name ==  "DOMWidgetModel") {
            // We never actually listen to a bare DOMWidgetModel. However,
            // the InstanceDict trait type initializes to a basic version
            // of the required class...so effectively, we should treat
            // this model as undefined.
            return
        }
        console.log('current model is ', current_model, 'previous is ', previous_model)
        console.log('view_count is ', current_model.get('_view_count'))
        if (! (typeof(current_model.get('_view_count')) === "number")) {
            // Sorry, but we need the view count...
            console.log('Setting _view_count to a number')
            current_model.set('_view_count', 0)
        }
        console.log('Adding backbone listener for changes in view count')
        this.listenTo(current_model, 'change:_view_count', this.update_listeners)
        this.update_listeners()
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

    _add_listeners_to_view(view) {
        for (let event of this.get('watched_events')) {
            switch (this.key_or_mouse(event)) {
                case "keyboard":
                    this._add_key_listener(event, view)
                    break
                case "mouse":
                    let prevent_default = this.get('prevent_default_action')
                    let handler = this._dom_click.bind(this, view)
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
                this._add_listeners_to_view(view)
            })
        })
    }

    _add_key_listener(event_type, view) {
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
            if (this.get('ignore_modifier_key_events') &&
               _.contains(this.get('_modifier_keys'), event.key)) {
                // If the key event is supposed to be ignored, then skip it.
                return
            }
            this._send_dom_event(event)
            // Need this (and useCapture in the listener) to prevent the keypress
            // from propagating to the notebook.
            event.stopPropagation()
            event.preventDefault()
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


    _dom_click(generating_view, event) {
        // Get coordinates relative to the
        let relative_xy = _get_position(generating_view, event)
        event['relativeX'] = relative_xy.x
        event['relativeY'] = relative_xy.y
        if ('_array_xy' in generating_view) {
            console.log("Hey, nice Image!")
            let array_coords = generating_view['_array_xy'](event)
            event['arrayX'] = array_coords.x
            event['arrayY'] = array_coords.y
        }
        if ((event.type == 'wheel') || this.get('prevent_default_action')) {
            event.preventDefault()
        }
        this._send_dom_event(event)
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
                message_names = message_names.concat(mouse_added_event_message_names)
                if (event.type == 'wheel') {
                    message_names = message_names.concat(wheel_standard_event_names)
                } else if (event.type == 'drop' || event.type.startsWith('drag')) {
                    message_names = message_names.concat(drag_standard_event_names)
                }
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
        }
        event_message['event'] = event['type']
        this.send(event_message, {})
    }
}

