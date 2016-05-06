// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var $ = require('./jquery');
var _ = require('underscore');


function scrollIfNeeded(area, elem) {
    var ar = area.getBoundingClientRect();
    var er = elem.getBoundingClientRect();
    if (er.top < ar.top) {
        area.scrollTop -= ar.top - er.top;
    } else if (er.bottom > ar.bottom) {
        area.scrollTop += er.bottom - ar.bottom;
    }
}

var SelectionModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'SelectionModel',
        selected_label: '',
        _options_labels: [],
        disabled: false,
        description: ''
    })
});

var DropdownModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'DropdownModel',
        _view_name: 'DropdownView',
        button_style: ''
    })
});

var DropdownView = widget.DOMWidgetView.extend({
    initialize: function() {
        this.onKeydown = this._handle_keydown.bind(this);
        this.onDismiss = this._handle_dismiss.bind(this);
        DropdownView.__super__.initialize.apply(this, arguments);
    },

    remove: function() {
        document.body.removeChild(this.droplist);
        return DropdownView.__super__.remove.call(this);
    },

    render: function() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-dropdown');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.buttongroup.className = 'widget-item';
        this.el.appendChild(this.buttongroup);

        this.droplabel = document.createElement('button');
        this.droplabel.className = 'widget-dropdown-toggle widget-button';
        this.buttongroup.appendChild(this.droplabel);

        this.dropbutton = document.createElement('button');
        this.dropbutton.className = 'widget-dropdown-toggle widget-button';

        this.caret = document.createElement('i');
        this.caret.className = 'widget-caret';
        this.dropbutton.appendChild(this.caret);
        this.buttongroup.appendChild(this.dropbutton);

        // Drop lists are appended to the document body and absolutely
        // positioned so that they can appear outside the flow of whichever
        // container they were instantiated in.
        this.droplist = document.createElement('ul');
        this.droplist.className = 'widget-dropdown-droplist';
        document.body.appendChild(this.droplist);
        this.droplist.addEventListener('click', this._handle_click.bind(this));

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update_button_style();

        // Set defaults.
        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var links = _.pluck(this.droplist.querySelectorAll('a'), 'textContent');
        var disabled = this.model.get('disabled');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (links[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            this.droplist.textContent = '';
            _.each(items, function(item) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                li.className = 'widget-dropdown-item';
                a.setAttribute('href', '#');
                a.textContent = item;
                li.appendChild(a);
                view.droplist.appendChild(li);
            });
        }

        this.droplabel.disabled = disabled;
        this.dropbutton.disabled = disabled;

        var value = this.model.get('value') || '';
        if (value.trim().length === 0) {
            this.droplabel.innerHTML = '&nbsp;';
        } else {
            this.droplabel.textContent = value;
        }

        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }

        return DropdownView.__super__.update.call(this);
    },

    update_button_style: function() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        this.update_mapped_classes(class_map, 'button_style', this.droplabel);
        this.update_mapped_classes(class_map, 'button_style', this.dropbutton);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name.substring(0, 6) === 'border' ||
            name === 'background' ||
            name === 'color') {
            this.droplabel.style[name] = value;
            this.dropbutton.style[name] = value;
            this.droplist.style[name] = value;
        } else {
            this.el.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'click button.widget-button': '_toggle',
        'keydown button.widget-button': '_activate'
    },

    /**
     * Handles when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click: function(event) {
        event.stopPropagation();
        event.preventDefault();

        // Manually hide the droplist.
        this._toggle();

        var value = event.target.textContent;
        this.model.set('value', value, { updated_view: this });
        this.touch();
    },

    /**
     * Handles browser events that cause a dismissal of the drop list.
     */
    _handle_dismiss: function(event) {
        // Check if the event came from the drop list itself.
        var node = event.target;
        var dropdownEvent;
        while (node !== document.documentElement) {
            dropdownEvent = node === this.droplist ||
                node === this.droplabel || // This is relevant for mousedowns.
                node === this.dropbutton;  // This is relevant for mousedowns.
            if (dropdownEvent) {
                return;
            }
            node = node.parentNode;
        }
        // If some error condition has caused this listener to still be active
        // despite the drop list being invisible, remove all global listeners.
        if (!this.droplist.classList.contains('mod-active')) {
            document.removeEventListener('keydown', this.onKeydown);
            document.removeEventListener('mousedown', this.onDismiss);
            window.removeEventListener('scroll', this.onDismiss);
            return;
        }
        // Deselect active item.
        var active = this.droplist.querySelector('.mod-active');
        if (active) {
            active.classList.remove('mod-active');
        }
        // Close the drop list.
        this.droplist.classList.remove('mod-active');
        // Remove global keydown listener.
        document.removeEventListener('keydown', this.onKeydown);
        // Remove global mousedown listener.
        document.removeEventListener('mousedown', this.onDismiss);
        // Remove global scroll listener.
        window.removeEventListener('scroll', this.onDismiss);
        return;
    },

    /**
     * Handles keydown events for navigating the drop list.
     */
    _handle_keydown: function(event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        // If some error condition has caused this listener to still be active
        // despite the drop list being invisible, remove all global listeners.
        if (!this.droplist.classList.contains('mod-active')) {
            document.removeEventListener('keydown', this.onKeydown);
            document.removeEventListener('mousedown', this.onDismiss);
            window.removeEventListener('scroll', this.onDismiss);
            return;
        }

        switch (event.keyCode) {
        case 13:  // Enter key
            event.preventDefault();
            event.stopPropagation();
            var active = this.droplist.querySelector('.mod-active');
            if (active) {
                var value = active.textContent;
                this.model.set('value', value, { updated_view: this });
                this.touch();
            }
            // Close the drop list.
            this._toggle();
            this.dropbutton.focus();
            return;
        case 27:  // Escape key
            event.preventDefault();
            event.stopPropagation();
            // Close the drop list.
            this._toggle();
            this.dropbutton.focus();
            return;
        case 38:  // Up arrow key
            event.preventDefault();
            event.stopPropagation();
            var active = this.droplist.querySelector('.mod-active');
            var items = this.droplist.querySelectorAll('.widget-dropdown-item');
            var index;
            if (active) {
                index = _.indexOf(items, active);
                index = Math.max(0, index - 1);
                active.classList.remove('mod-active');
            } else {
                // If there is no selection, up arrow selects the last item.
                index = items.length - 1;
            }
            items[index].classList.add('mod-active');
            scrollIfNeeded(this.droplist, items[index]);
            return;
        case 40:  // Down arrow key
            event.preventDefault();
            event.stopPropagation();
            var active = this.droplist.querySelector('.mod-active');
            var items = this.droplist.querySelectorAll('.widget-dropdown-item');
            var index;
            if (active) {
                index = _.indexOf(items, active);
                index = Math.min(items.length - 1, index + 1);
                active.classList.remove('mod-active');
            } else {
                // If there is no selection, down arrow selects the first item.
                index = 0;
            }
            items[index].classList.add('mod-active');
            scrollIfNeeded(this.droplist, items[index]);
            return;
        }
    },

    /**
     * Activate the drop list.
     *
     * If the drop button is focused and the user presses enter, up, or down,
     * activate the drop list.
     */
    _activate: function(event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        switch (event.keyCode) {
        case 13:  // Enter key
        case 38:  // Up arrow key
        case 40:  // Down arrow key
            event.preventDefault();
            event.stopPropagation();
            this._toggle();
            return;
        }
    },

    /**
     * Toggle the dropdown list.
     *
     * If the dropdown list doesn't fit below the dropdown label, this will
     * cause the dropdown to be dropped 'up'.
     */
    _toggle: function() {
        this.droplabel.blur();
        this.dropbutton.blur();

        if (this.droplist.classList.contains('mod-active')) {
            // Deselect active item.
            var active = this.droplist.querySelector('.mod-active');
            if (active) {
                active.classList.remove('mod-active');
            }
            // Close the drop list.
            this.droplist.classList.remove('mod-active');
            // Remove global keydown listener.
            document.removeEventListener('keydown', this.onKeydown);
            // Remove global mousedown listener.
            document.removeEventListener('mousedown', this.onDismiss);
            // Remove global scroll listener.
            window.removeEventListener('scroll', this.onDismiss);
            return;
        }

        // Add a global keydown listener for drop list events.
        document.addEventListener('keydown', this.onKeydown, true);
        // Add a global mousedown listener to dismiss drop list.
        document.addEventListener('mousedown', this.onDismiss, true);
        // Add a global scroll listener to dismiss drop list.
        window.addEventListener('scroll', this.onDismiss, true);

        // Set the currently selected item of the drop list.
        var value = this.model.get('value');
        var selectedIndex = _.indexOf(this.model.get('_options_labels'), value);
        if (selectedIndex > -1) {
            var items = this.droplist.querySelectorAll('.widget-dropdown-item');
            items[selectedIndex].classList.add('mod-active');
        }

        var buttongroupRect = this.buttongroup.getBoundingClientRect();
        var availableHeightAbove = buttongroupRect.top;
        var availableHeightBelow = window.innerHeight - buttongroupRect.bottom;
        // Account for 1px border.
        availableHeightAbove += 1;
        availableHeightBelow -= 1;
        var width = buttongroupRect.width;
        var maxHeight = Math.floor(
            Math.max(availableHeightAbove, availableHeightBelow)
        );
        var top = 0;
        var left = buttongroupRect.left;

        this.droplist.style.left = left + 'px';
        this.droplist.style.maxHeight = maxHeight + 'px';
        this.droplist.style.width = width + 'px';

        // Make drop list visible to compute its dimensions.
        this.droplist.classList.add('mod-active');

        var droplistRect = this.droplist.getBoundingClientRect();

        // If the drop list fits below, render below.
        if (droplistRect.height <= availableHeightBelow) {
            // Account for 1px border.
            top = Math.ceil(buttongroupRect.bottom + 1);
            this.droplist.style.top = top + 'px';
        // If the drop list fits above, render above.
        } else if (droplistRect.height <= availableHeightAbove) {
            // Account for 1px border.
            top = Math.floor(buttongroupRect.top - droplistRect.height + 1);
            this.droplist.style.top = top + 'px';
        // Otherwise, render in whichever has more space, above or below.
        } else if (availableHeightBelow >= availableHeightAbove) {
            // Account for 1px border.
            top = Math.ceil(buttongroupRect.bottom + 1);
            this.droplist.style.top = top + 'px';
        } else {
            // Account for 1px border.
            top = Math.floor(buttongroupRect.top - droplistRect.height + 1);
            this.droplist.style.top = top + 'px';
        }

        // If a selection is active, scroll to it if necessary.
        if (selectedIndex > -1) {
            scrollIfNeeded(this.droplist, items[selectedIndex]);
        }
    }
});

var RadioButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'RadioButtonsModel',
        _view_name: 'RadioButtonsView',
        tooltips: [],
        icons: [],
        button_style: ''
    })
});

var RadioButtonsView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-radio');

        this.label = document.createElement('div');
        this.label.className = 'widget-label';
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        this.container = document.createElement('div');
        this.el.appendChild(this.container);
        this.container.classList.add('widget-radio-box');

        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var radios = _.pluck(
            this.container.querySelectorAll('input[type="radio"]'),
            'value'
        );
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (radios[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            // Add items to the DOM.
            this.container.textContent = '';
            _.each(items, function(item) {
                var label = document.createElement('label');
                label.textContent = item;
                view.container.appendChild(label);

                var radio = document.createElement('input');
                radio.setAttribute('type', 'radio');
                radio.value = item;
                radio.setAttribute('data-value', encodeURIComponent(item));
                label.appendChild(radio);
            });
        }
        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.label.textContent = description;
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
        _.each(items, function(item) {
            var item_query = 'input[data-value="' +
                encodeURIComponent(item) + '"]';
            var radio = view.container.querySelectorAll(item_query);
            if (radio.length > 0) {
              var radio_el = radio[0];
              radio_el.checked = view.model.get('selected_label') === item;
              radio_el.disabled = view.model.get('disabled');
            }
        });
        return RadioButtonsView.__super__.update.call(this);
    },

    update_attr: function(name, value) {
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this.container.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'click input[type="radio"]': '_handle_click'
    },

    _handle_click: function (event) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = event.target.value;
        this.model.set('selected_label', value, {updated_view: this});
        this.touch();
    }
});

var ToggleButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'ToggleButtonsModel',
        _view_name: 'ToggleButtonsView'
    })
});

var ToggleButtonsView = widget.DOMWidgetView.extend({
    initialize: function() {
        this._css_state = {};
        ToggleButtonsView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widgets-hbox');
        this.el.classList.add('widget-toggle-buttons');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.el.appendChild(this.buttongroup);

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var icons = this.model.get('icons') || [];
        var previous_icons = this.model.previous('icons') || [];
        var tooltips = view.model.get('tooltips') || [];
        var disabled = this.model.get('disabled');
        var buttons = this.buttongroup.querySelectorAll('button');
        var values = _.pluck(buttons, 'value');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (values[i] !== items[i] || icons[i] !== previous_icons[i]) {
                stale = true;
                break;
            }
        }

        if (stale && options === undefined || options.updated_view !== this) {
            // Add items to the DOM.
            this.buttongroup.textContent = '';
            _.each(items, function(item, index) {
                var item_html;
                var empty = item.trim().length === 0 &&
                    (!icons[index] || icons[index].trim().length === 0);
                if (empty) {
                    item_html = '&nbsp;';
                } else {
                    item_html = utils.escape_html(item);
                }

                var icon = document.createElement('i');
                var button = document.createElement('button');
                if (icons[index]) {
                    icon.className = 'fa fa-' + icons[index];
                }
                button.setAttribute('type', 'button');
                button.className = 'widget-toggle-button';
                button.innerHTML = item_html;
                button.setAttribute('data-value', encodeURIComponent(item));
                button.setAttribute('value', item);
                button.appendChild(icon);
                button.disabled = disabled;
                if (tooltips[index]) {
                    button.setAttribute('title', tooltips[index]);
                }
                view.update_style_traits(button);
                view.buttongroup.appendChild(button);
            });
        }

        // Select active button.
        _.each(items, function(item) {
            var item_query = '[data-value="' + encodeURIComponent(item) + '"]';
            var button = view.buttongroup.querySelector(item_query);
            if (view.model.get('value') === item) {
                button.classList.add('mod-active');
            } else {
                button.classList.remove('mod-active');
            }
        });

        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.label.textContent = '';
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
        this.update_button_style();
        return ToggleButtonsView.__super__.update.call(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this._css_state[name] = value;
            this.update_style_traits();
        }
    },

    update_style_traits: function(button) {
        for (var name in this._css_state) {
            if (this._css_state.hasOwnProperty(name)) {
                if (name === 'margin') {
                    this.buttongroup.style[name] = this._css_state[name];
                } else if (name !== 'width') {
                    if (button) {
                        button.style[name] = this._css_state[name];
                    } else {
                        var buttons = this.buttongroup
                            .querySelectorAll('button');
                        if (buttons.length) {
                            buttons[0].style[name] = this._css_state[name];
                        }
                    }
                }
            }
        }
    },

    update_button_style: function() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        var view = this;
        var buttons = this.buttongroup.querySelectorAll('button');
        _.each(buttons, function(button) {
            view.update_mapped_classes(class_map, 'button_style', button);
        });
    },

    events: {
        // Dictionary of events and their handlers.
        'click button': '_handle_click'
    },

    _handle_click: function (event) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = event.target.value;
        this.model.set('value', value, { updated_view: this });
        this.touch();
    }
});

var SelectModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'SelectModel',
        _view_name: 'SelectView'
    })
});

var SelectView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-select');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listbox = document.createElement('select');
        this.listbox.className = 'widget-listbox';
        this.listbox.setAttribute('size', '6');
        this.el.appendChild(this.listbox);

        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var options = _.pluck(this.listbox.options, 'value');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (options[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            // Add items to the DOM.
            this.listbox.textContent = '';

            _.each(items, function(item, index) {
                var item_query = 'option[data-value="' +
                    encodeURIComponent(item) + '"]';
                var item_exists = view.listbox
                    .querySelectorAll(item_query).length !== 0;
                var option;
                if (!item_exists) {
                    option = document.createElement('option');
                    option.textContent = item.replace ?
                        item.replace(/ /g, '\xa0') : item;
                    option.setAttribute('data-value', encodeURIComponent(item));
                    option.value = item;
                    view.listbox.appendChild(option);
                }
            });

            // Disable listbox if needed
            this.listbox.disabled = this.model.get('disabled');

            // Select the correct element
            var value = view.model.get('selected_label');
            view.listbox.selectedIndex = items.indexOf(value);

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return SelectView.__super__.update.call(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this.listbox.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'change select': '_handle_change'
    },

    _handle_change: function() {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = this.listbox.options[this.listbox.selectedIndex].value;
        this.model.set('selected_label', value, {updated_view: this});
        this.touch();
    }
});

var SelectionSliderModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'SelectionSliderModel',
        _view_name: 'SelectionSliderView',
        orientation: 'horizontal',
        readout: true,
        continuous_update: true
    })
});

var SelectionSliderView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.$el.addClass('jupyter-widgets widget-hbox widget-hslider');

        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.$el.append(this.label);

        this.$slider = $('<div />')
            .slider({
                slide: this.handleSliderChange.bind(this),
                stop: this.handleSliderChanged.bind(this)
            })
            .addClass('slider');

        // Put the slider in a container
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.$slider[0]);
        this.$el.append(this.slider_container);

        this.readout = document.createElement('div');
        this.$el.append(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.style.display = 'none';

        this.listenTo(this.model, 'change:slider_color', function(sender, value) {
            this.$slider.find('a').css('background', value);
        }, this);
        this.listenTo(this.model, 'change:description', function(sender, value) {
            this.updateDescription();
        }, this);

        this.$slider.find('a').css('background', this.model.get('slider_color'));

        // Set defaults.
        this.update();
        this.updateDescription();
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'color') {
            this.readout.style[name] = value;
        } else if (name.substring(0, 4) == 'font') {
            this.readout.style[name] = value;
        } else if (name.substring(0, 6) == 'border') {
            var slider_items = this.$slider[0].querySelectorAll('a');
            if (slider_items.length) {
              slider_items[0].style[name] = value;
            }
            this.slider_container.style[name] = value;
        } else if (name == 'background') {
            this.slider_container.style[name] = value;
        } else {
            this.el.style[name] = value;
        }
    },

    updateDescription: function(options) {
        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            var labels = this.model.get('_options_labels');
            var max = labels.length - 1;
            var min = 0;
            this.$slider.slider('option', 'step', 1);
            this.$slider.slider('option', 'max', max);
            this.$slider.slider('option', 'min', min);

            // WORKAROUND FOR JQUERY SLIDER BUG.
            // The horizontal position of the slider handle
            // depends on the value of the slider at the time
            // of orientation change.  Before applying the new
            // workaround, we set the value to the minimum to
            // make sure that the horizontal placement of the
            // handle in the vertical slider is always
            // consistent.
            var orientation = this.model.get('orientation');
            this.$slider.slider('option', 'value', min);
            this.$slider.slider('option', 'orientation', orientation);

            var value = this.model.get('value');
            var index = labels.indexOf(value);
            this.$slider.slider('option', 'value', index);
            this.readout.textContent = value;

            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation === 'vertical') {
                this.$el
                    .removeClass('widget-hslider')
                    .addClass('widget-vslider');
                this.$el
                    .removeClass('widget-hbox')
                    .addClass('widget-vbox');

            } else {
                this.$el
                    .removeClass('widget-vslider')
                    .addClass('widget-hslider');

                this.$el
                    .removeClass('widget-vbox')
                    .addClass('widget-hbox');
            }

            var readout = this.model.get('readout');
            if (readout) {
                // this.$readout.show();
                this.readout.style.display = '';
            } else {
                // this.$readout.hide();
                this.readout.style.display = 'none';
            }
        }
        return SelectionSliderView.__super__.update.call(this);
    },

    events: {
        // Dictionary of events and their handlers.
        'slide': 'handleSliderChange',
        'slidestop': 'handleSliderChanged'
    },

    /**
     * Called when the slider value is changing.
     */
    handleSliderChange: function(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var selected_label = this.model.get('_options_labels')[actual_value];
        this.readout.textContent = selected_label;

        // Only persist the value while sliding if the continuous_update
        // trait is set to true.
        if (this.model.get('continuous_update')) {
            this.handleSliderChanged(e, ui);
        }
    },

    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged: function(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var selected_label = this.model.get('_options_labels')[actual_value];
        this.readout.textContent = selected_label;
        this.model.set('selected_label', selected_label, {updated_view: this});
        this.touch();
    },

    _validate_slide_value: function(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         */
        return Math.floor(x);
    }
});

var MultipleSelectionModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'MultipleSelectionModel',
        selected_labels: []
    })
});

var SelectMultipleModel = MultipleSelectionModel.extend({
    defaults: _.extend({}, MultipleSelectionModel.prototype.defaults, {
        _model_name: 'SelectMultipleModel',
        _view_name: 'SelectMultipleView'
    })
});

var SelectMultipleView = SelectView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        SelectMultipleView.__super__.render.call(this);
        this.el.classList.remove('widget-select');
        this.el.classList.add('widget-select-multiple');
        this.listbox.multiple = true;
        this.update();
    },

    update: function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        SelectMultipleView.__super__.update.apply(this, arguments);
        var selected = this.model.get('value') || [];
        var values = _.map(selected, encodeURIComponent);
        var options = this.listbox.options;
        for (var i = 0, len = options.length; i < len; ++i) {
            var value = options[i].getAttribute('data-value');
            options[i].selected = _.contains(values, value);
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'change select': '_handle_change'
    },

    _handle_change: function() {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */

        // In order to preserve type information correctly, we need to map
        // the selected indices to the options list.
        var items = this.model.get('_options_labels');
        var values = Array.prototype.map
            .call(this.listbox.selectedOptions || [], function(option) {
                return items[option.index];
            });
        this.model.set('value', values, {updated_view: this});
        this.touch();
    }
});

module.exports = {
    SelectionModel: SelectionModel,
    DropdownView: DropdownView,
    DropdownModel: DropdownModel,
    RadioButtonsView: RadioButtonsView,
    RadioButtonsModel: RadioButtonsModel,
    ToggleButtonsView: ToggleButtonsView,
    ToggleButtonsModel: ToggleButtonsModel,
    SelectView: SelectView,
    SelectModel: SelectModel,
    SelectionSliderView: SelectionSliderView,
    SelectionSliderModel: SelectionSliderModel,
    MultipleSelectionModel: MultipleSelectionModel,
    SelectMultipleView: SelectMultipleView,
    SelectMultipleModel: SelectMultipleModel
};
