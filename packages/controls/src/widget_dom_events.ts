import {
    WidgetModel, WidgetView, DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

let watchable_mouse_events = [
    'click',
    'auxclick',
    'dblclick',
    'mouseenter',
    'mouseleave',
    'mousedown',
    'mouseup'
]

let watchable_key_events = [
    'keydown',
    'keyup'
]

let common_event_message_names = [
    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',
    'type'
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
    'imageX',
    'imageY'
]

let key_standard_event_names = [
    'code',
    'key',
    'location',
    'repeat'
]

function dom_click(generating_view, event) {
    if (generating_view.model.get('_view_name') == 'ImageView') {
        console.log("Hey, nice Image!")
    }
    this._handle_click(event)
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
            _attached_listeners: []
            });
    }

    initialize(attributes, options: {model_id: string, comm?: any, widget_manager: any}) {
        super.initialize(attributes, options);
        this.on('change:source', this.update_listeners, this)
        this.on('change:watched_events', this.update_listeners, this)
    }

    key_or_mouse(event_type) {
        if (_.contains(watchable_mouse_events, event_type)) {
            return 'mouse'
        }
        if (_.contains(watchable_key_events, event_type)) {
            return 'keyboard'
        }
    }

    _cache_listeners(event_type, view, handler) {
        this.get('_attached_listeners').push({
            event: event_type,
            view: view,
            func: handler,
        })
    }

    update_listeners() {
        this.remove_listeners()
        this.attach_listeners()
    }

    remove_listeners() {
        for (let listener of this.get('_attached_listeners')) {
            console.log('Removing ', listener.event, ' from ', listener.view, 'function', listener.func)
            listener.view.el.removeEventListener(listener.event, listener.func)
        }
        this.set('_attached_listeners', [])
    }

    attach_listeners() {
        // console.log("Attaching listeners")
        let current_source = this.get('source')
        _.each(current_source.views, (view_promise) => {
            Promise.resolve(view_promise).then((view: DOMWidgetView) => {
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
            })
        })
    }

    add_key_listener(event_type, view) {
        let key_handler = (event) => {
            // console.log('Key presses FTW!', event)
            this._handle_click(event)
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

    _handle_click(event) {
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

