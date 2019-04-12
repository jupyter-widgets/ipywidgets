// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    DescriptionView
} from './widget_description';

import {
    uuid
} from './utils';

import {
    DOMWidgetView
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

export
class StringModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: '',
            disabled: false,
            placeholder: '\u200b',
            _model_name: 'StringModel'
        });
    }
}

export
class HTMLModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'HTMLView',
            _model_name: 'HTMLModel'
        });
    }
}

export
class HTMLView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-html');
        this.content = document.createElement('div');
        this.content.classList.add('widget-html-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.content.innerHTML = this.model.get('value');
        return super.update();
    }

    content: HTMLDivElement;
}


export
class HTMLMathModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'HTMLMathView',
            _model_name: 'HTMLMathModel'
        });
    }
}

export
class HTMLMathView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-htmlmath');
        this.content = document.createElement('div');
        this.content.classList.add('widget-htmlmath-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     */
    update() {
        this.content.innerHTML = this.model.get('value');
        this.typeset(this.content);
        return super.update();
    }

    content: HTMLDivElement;
}

export
class LabelModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'LabelView',
            _model_name: 'LabelModel',
            draggable : false,
            drag_data: {}
        });
    }
}

export
class Droppable {

    /** Droppbable mixin
     * Implements handler for drop events.
     * The view class implementing this interface needs to
     * listen to 'drop' event with '_handle_drop'
     *
     * In order to use this mixin, the view class needs to
     * implement the Droppable interface, define the following
     * placeholders:
     *
     *  _handle_drop : (event: Object) => void;
     *
     * and you need to call applyMixin on class definition.
     *
     * follows the example from typescript docs
     * https://www.typescriptlang.org/docs/handbook/mixins.html
     */

    send : (content : any, buffers? : any) => void;

    _handle_drop(event) {
        event.preventDefault();
        // var data = Array.from(event.dataTransfer.items, item => item.getAsString())

        let datamap = {};

        for (let i=0; i < event.dataTransfer.types.length; i++) {
          let t = event.dataTransfer.types[i];
          datamap[t] = event.dataTransfer.getData(t);
        }

        console.log(event.dataTransfer);
        this.send({event: 'drop', data: datamap});
    }

}

export
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

export
class Draggable {

    /** Draggable mixin.
     * Allows the widget to be draggable
     *
     * Note: In order to use it, you will need to add
     * handlers for dragstart, dragover event in the view class
     * also need to call dragSetup at initialization time
     *
     * The view class must implement Draggable interface and
     * declare the methods (no definition).
     * For example:
     *
     * on_dragstart : (event: Object) => void;
     * on_dragover : (event : Object) => void;
     * on_change_draggable : () => void;
     * dragSetup : () => void;
     *
     * Also need to call applyMixin on the view class
     * The model class needs to have drag_data attribute
     *
     * follows the example from typescript docs
     * https://www.typescriptlang.org/docs/handbook/mixins.html
     */

    model : StringModel;
    el : any;

    on_dragover(event) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    }

    on_dragstart(event) {
        event.dataTransfer.setData('text/plain', this.model.get('value'));
        let drag_data = this.model.get('drag_data');
        for (let datatype in drag_data) {
          event.dataTransfer.setData(datatype, drag_data[datatype]);
        }
        event.dataTransfer.setData('application/x-widget', this.model.model_id);
        event.dataTransfer.dropEffect = 'copy';
    }

    dragSetup() {
        this.el.draggable = this.model.get('draggable');
        this.model.on('change:draggable', this.on_change_draggable, this);
    }

    on_change_draggable() {
      this.el.draggable = this.model.get('draggable');
    }


}

export
class LabelView extends DescriptionView {
    /**
     * Called when view is rendered.
     */

    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-label');
        this.update(); // Set defaults.
    }


    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.typeset(this.el, this.model.get('value'));
        return super.update();
    }



}

export
class DraggableLabelView extends LabelView implements Droppable, Draggable {
    render() {
      super.render();
      this.dragSetup();
    }

    /**
     * Dictionary of events and handlers
     */
    events(): {[e:string] : string;} {
          return {'drop': '_handle_drop',
                  'dragstart' : 'on_dragstart',
                  'dragover' : 'on_dragover' };
    }

    // placeholders for the mixin methods

    _handle_drop : (event: Object) => void;
    on_dragstart : (event: Object) => void;
    on_dragover : (event : Object) => void;
    on_change_draggable : () => void;
    dragSetup : () => void;
}

applyMixins(DraggableLabelView, [Droppable, Draggable]);

export
class DraggableLabelModel extends LabelModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'DraggableLabelView',
            _model_name: 'DraggableLabelModel',
            draggable : false,
            drag_data: {}
        });
    }

}


export
class TextareaModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'TextareaView',
            _model_name: 'TextareaModel',
            rows: null,
            continuous_update: true,
        });
    }
}

export
class TextareaView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-textarea');

        this.textbox = document.createElement('textarea');
        this.textbox.setAttribute('rows', '5');
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.

        this.listenTo(this.model, 'change:placeholder',
            function(model, value, options) {
                this.update_placeholder(value);
        });

        this.update_placeholder();
    }

    update_placeholder(value?) {
        value = value || this.model.get('placeholder');
        this.textbox.setAttribute('placeholder', value.toString());
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
        if (options === undefined || options.updated_view != this) {
            this.textbox.value = this.model.get('value');
            let rows = this.model.get('rows');
            if (rows === null) {
                rows = '';
            }
            this.textbox.setAttribute('rows', rows);
            this.textbox.disabled = this.model.get('disabled');
        }
        return super.update();
    }

    events() {
        return {
            'keydown input'  : 'handleKeyDown',
            'keypress input' : 'handleKeypress',
            'input textarea'  : 'handleChanging',
            'change textarea' : 'handleChanged'
        };
    }

    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    handleKeyDown(e) {
        e.stopPropagation();
    }

    /**
     * Handles key press
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeypress(e) {
        e.stopPropagation();
    }

    /**
     * Triggered on input change
     */
    handleChanging(e) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    }

    /**
     * Sync the value with the kernel.
     *
     * @param e Event
     */
    handleChanged(e) {
        this.model.set('value', e.target.value, {updated_view: this});
        this.touch();
    }
    textbox: HTMLTextAreaElement;
}

export
class TextModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'TextView',
            _model_name: 'TextModel',
            continuous_update: true,
        });
    }
}

export
class TextView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-text');

        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', this.inputType);
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', function(model, value, options) {
            this.update_placeholder(value);
        });
        this.listenTo(this.model, 'change:description_tooltip', this.update_title);
        this.listenTo(this.model, 'change:description', this.update_title);

        this.update_placeholder();
        this.update_title();
    }

    update_placeholder(value?) {
        if (!value) {
            value = this.model.get('placeholder');
        }
        this.textbox.setAttribute('placeholder', value);
    }

    update_title() {
        let title = this.model.get('description_tooltip');
        if (!title) {
           this.textbox.removeAttribute('title');
        }
        else if (this.model.get('description').length === 0) {
            this.textbox.setAttribute('title', title);
        }
    }

    update(options?) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            if (this.textbox.value != this.model.get('value')) {
              this.textbox.value = this.model.get('value');
            }

            this.textbox.disabled = this.model.get('disabled');
        }
        return super.update();
    }

    events() {
        return {
            'keydown input'  : 'handleKeyDown',
            'keypress input' : 'handleKeypress',
            'input input'  : 'handleChanging',
            'change input' : 'handleChanged'
        };
    }

    /**
     * Handle key down
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeyDown(e) {
        e.stopPropagation();
    }

    /**
     * Handles text submission
     */
    handleKeypress(e) {
        e.stopPropagation();
        // The submit message is deprecated in widgets 7
        if (e.keyCode == 13) { // Return key
            this.send({event: 'submit'});
        }
    }

    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanging(e) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    }

    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanged(e) {
        this.model.set('value', e.target.value, {updated_view: this});
        this.touch();
    }


    protected readonly inputType: string = 'text';
    textbox: HTMLInputElement;
}

export
class PasswordModel extends TextModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'PasswordView',
            _model_name: 'PasswordModel'
        });
    }
}

export
class PasswordView extends TextView
{
    protected readonly inputType: string = 'password';
}
