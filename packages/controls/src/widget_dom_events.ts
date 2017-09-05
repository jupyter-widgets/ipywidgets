import {
    WidgetModel, WidgetView, DOMWidgetView
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

let known_events = [
    'click',
    'dblclick'
]

export
class MouseListenerModel extends WidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MouseListenerModel',
            _view_name: 'MouseListenerView',
            target: null
    }, known_events);
}}

export
class MouseListenerView extends WidgetView {

    initialize(parameters) {
        super.initialize(parameters);
        this.listenTo(this.model, 'change', this.bleep);
    }

    bleep() {
        console.log(this, this.model)
    }
}
