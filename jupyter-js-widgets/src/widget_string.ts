// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    LabeledDOMWidgetModel, LabeledDOMWidgetView
} from './widget';
import * as _ from 'underscore';

export
class StringModel extends LabeledDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: '',
            disabled: false,
            placeholder: '',
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
class HTMLView extends LabeledDOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-html');
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.el.innerHTML = this.model.get('value');
        return super.update();
    }
}


export
class LabelModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'LabelView',
            _model_name: 'LabelModel'
        });
    }
}

export
class LabelView extends LabeledDOMWidgetView {
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
class TextareaModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'TextareaView',
            _model_name: 'TextareaModel'
        });
    }
}

export
class TextareaView extends LabeledDOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-textarea');

        this.textbox = document.createElement('textarea');
        this.textbox.setAttribute('rows', '5');
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        this.listenTo(this.model, 'msg:custom', (content) => {
          this._handle_textarea_msg(content)
        });
        this.listenTo(this.model, 'change:placeholder',
            function(model, value, options) {
                this.update_placeholder(value);
            });

        this.update_placeholder();
    }

    /**
     * Handle when a custom msg is recieved from the back-end.
     */
    _handle_textarea_msg (content) {
        if (content.method == 'scroll_to_bottom') {
            this.scroll_to_bottom();
        }
    }

    update_placeholder(value?) {
        value = value || this.model.get('placeholder');
        this.textbox.setAttribute('placeholder', value.toString());
    }

    /**
     * Scroll the text-area view to the bottom.
     */
    scroll_to_bottom () {
        //this.$textbox.scrollTop(this.$textbox[0].scrollHeight); // DW TODO
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

            var disabled = this.model.get('disabled');
            this.textbox.disabled = disabled;
        }
        return super.update();
    }

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'keydown textarea'  : 'handleKeyDown',
            'keypress textarea' : 'handleKeypress',
            'keyup textarea' : 'handleChanging',
            'paste textarea' : 'handleChanging',
            'cut textarea'   : 'handleChanging'
        }
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
     * Handles and validates user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanging(e) {
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
            _model_name: 'TextModel'
        });
    }
}

export
class TextView extends LabeledDOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-text');

        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', 'text');
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', function(model, value, options) {
            this.update_placeholder(value);
        });

        this.update_placeholder();
    }

    update_placeholder(value?) {
        if (!value) {
            value = this.model.get('placeholder');
        }
        this.textbox.setAttribute('placeholder', value);
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

            var disabled = this.model.get('disabled');
            this.textbox.disabled = disabled;
        }
        return super.update();
    }

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'keydown input'  : 'handleKeyDown',
            'keypress input' : 'handleKeypress',
            'keyup input'    : 'handleChanging',
            'paste input'    : 'handleChanging',
            'cut input'      : 'handleChanging',
            'blur input'     : 'handleBlur',
            'focusout input' : 'handleFocusOut'
        }
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
        if (e.keyCode == 13) { // Return key
            this.send({event: 'submit'});
            e.preventDefault();
        }
    }

    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanging(e) {
        e.stopPropagation();
        this.model.set('value', e.target.value, {updated_view: this});
        this.touch();
    }

    /**
     * Prevent a blur from firing if the blur was not user intended.
     * This is a workaround for the return-key focus loss bug.
     * TODO: Is the original bug actually a fault of the keyboard
     * manager?
     */
    handleBlur(e) {
        if (e.relatedTarget === null) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    /**
     * Prevent a blur from firing if the blur was not user intended.
     * This is a workaround for the return-key focus loss bug.
     */
    handleFocusOut(e) {
        if (e.relatedTarget === null) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    textbox: HTMLInputElement;
}
