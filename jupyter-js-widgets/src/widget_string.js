// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var _ = require('underscore');

var StringModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        value: '',
        disabled: false,
        description: '',
        placeholder: '',
        _model_name: 'StringModel'
    })
});

var HTMLModel = StringModel.extend({
    defaults: _.extend({}, StringModel.prototype.defaults, {
        _view_name: 'HTMLView',
        _model_name: 'HTMLModel'
    })
});

var HTMLView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-html');
        this.update(); // Set defaults.
    },

    update : function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        this.el.innerHTML = this.model.get('value');
        return HTMLView.__super__.update.apply(this);
    }
});

var LabelModel = StringModel.extend({
    defaults: _.extend({}, StringModel.prototype.defaults, {
        _view_name: 'LabelView',
        _model_name: 'LabelModel'
    })
});

var LabelView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-latex');
        this.update(); // Set defaults.
    },

    update : function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        this.typeset(this.el, this.model.get('value'));
        return LabelView.__super__.update.apply(this);
    }
});

var TextareaModel = StringModel.extend({
    defaults: _.extend({}, StringModel.prototype.defaults, {
        _view_name: 'TextareaView',
        _model_name: 'TextareaModel'
    })
});

var TextareaView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-textarea');

        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        this.textbox = document.createElement('textarea');
        this.textbox.setAttribute('rows', 5);
        this.textbox.classList.add('form-control');
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        var model = this;
        this.listenTo(this.model, 'msg:custom', function() {
          model._handle_textarea_msg()
        });
        this.listenTo(this.model, 'change:placeholder',
            function(model, value, options) {
                this.update_placeholder(value);
            }, this);

        this.update_placeholder();
    },

    _handle_textarea_msg: function (content) {
        /**
         * Handle when a custom msg is recieved from the back-end.
         */
        if (content.method == 'scroll_to_bottom') {
            this.scroll_to_bottom();
        }
    },

    update_placeholder: function(value) {
        value = value || this.model.get('placeholder');
        this.textbox.setAttribute('placeholder', value);
    },

    scroll_to_bottom: function () {
        /**
         * Scroll the text-area view to the bottom.
         */
        //this.$textbox.scrollTop(this.$textbox[0].scrollHeight); // DW TODO
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            this.textbox.value = this.model.get('value');

            var disabled = this.model.get('disabled');
            this.textbox.disabled = disabled;

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return TextareaView.__super__.update.apply(this);
    },

    events: {
        // Dictionary of events and their handlers.
        'keyup textarea' : 'handleChanging',
        'paste textarea' : 'handleChanging',
        'cut textarea'   : 'handleChanging'
    },

    handleChanging: function(e) {
        /**
         * Handles and validates user input.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set('value', e.target.value, {updated_view: this});
        this.touch();
    }
});

var TextModel = StringModel.extend({
    defaults: _.extend({}, StringModel.prototype.defaults, {
        _view_name: 'TextView',
        _model_name: 'TextModel'
    })
});

var TextView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-text');
        this.label = document.createElement('div');
        this.label.className = 'widget-label';
        this.el.appendChild(this.label);
        this.label.style.display = 'none';

        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', 'text');
        this.textbox.className = 'form-control';
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', function(model, value, options) {
            this.update_placeholder(value);
        }, this);

        this.update_placeholder();
    },

    update_placeholder: function(value) {
        if (!value) {
            value = this.model.get('placeholder');
        }
        this.textbox.setAttribute('placeholder', value);
    },

    update: function(options) {
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

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return TextView.__super__.update.apply(this);
    },

    events: {
        // Dictionary of events and their handlers.
        'keyup input'    : 'handleChanging',
        'paste input'    : 'handleChanging',
        'cut input'      : 'handleChanging',
        'keypress input' : 'handleKeypress',
        'blur input'     : 'handleBlur',
        'focusout input' : 'handleFocusOut'
    },

    handleChanging: function(e) {
        /**
         * Handles user input.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set('value', e.target.value, {updated_view: this});
        this.touch();
    },

    handleKeypress: function(e) {
        /**
         * Handles text submition
         */
        if (e.keyCode == 13) { // Return key
            this.send({event: 'submit'});
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    },

    handleBlur: function(e) {
        /**
         * Prevent a blur from firing if the blur was not user intended.
         * This is a workaround for the return-key focus loss bug.
         * TODO: Is the original bug actually a fault of the keyboard
         * manager?
         */
        if (e.relatedTarget === null) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    },

    handleFocusOut: function(e) {
        /**
         * Prevent a blur from firing if the blur was not user intended.
         * This is a workaround for the return-key focus loss bug.
         */
        if (e.relatedTarget === null) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }
});

module.exports = {
    StringModel: StringModel,
    HTMLView: HTMLView,
    HTMLModel: HTMLModel,
    LabelView: LabelView,
    LabelModel: LabelModel,
    TextareaView: TextareaView,
    TextareaModel: TextareaModel,
    TextView: TextView,
    TextModel: TextModel
};
