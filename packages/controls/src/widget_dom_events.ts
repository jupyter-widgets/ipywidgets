import {
    WidgetModel, WidgetView, DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

let known_events = [
    'click',
    'dblclick'
]

function dom_click(generating_view, event) {
    console.log('dommed click', event)
    console.log('clicked in view', generating_view)
    console.log('from mouse listener model', this)
    this._handle_click(event)
}

export
class MouseListenerModel extends WidgetModel {
    static serializers = {
        ...WidgetModel.serializers,
        source: {deserialize: unpack_models},
    }
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MouseListenerModel',
            _view_name: 'MouseListenerView',
            source: null
            });
    }
    initialize(attributes, options: {model_id: string, comm?: any, widget_manager: any}) {
        super.initialize(attributes, options);
        this.on('change:source', this.attach_listeners, this)
    }

    attach_listeners() {
        console.log("Attaching listeners")
        var current_source = this.get('source')
        _.each(current_source.views, (view_promise) => {
            Promise.resolve(view_promise).then((view: DOMWidgetView) => {
                view.el.addEventListener("click", dom_click.bind(this, view))
            })
        })
    }

    _handle_click(event) {
        console.log('Sending to python!')
        this.send({event: 'click', nonsense: 'foo'}, {})
    }
}

export
class MouseListenerView extends WidgetView {

}
