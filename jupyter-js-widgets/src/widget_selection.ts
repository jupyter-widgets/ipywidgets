// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, unpack_models, ViewList
} from './widget';

import * as _ from 'underscore';
import * as utils from './utils';
import * as $ from 'jquery';

function scrollIfNeeded(area, elem) {
    var ar = area.getBoundingClientRect();
    var er = elem.getBoundingClientRect();
    if (er.top < ar.top) {
        area.scrollTop -= ar.top - er.top;
    } else if (er.bottom > ar.bottom) {
        area.scrollTop += er.bottom - ar.bottom;
    }
}

export
class SelectionModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectionModel',
            selected_label: '',
            _options_labels: [],
            disabled: false,
            description: ''
        });
    }
}

export
class DropdownModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'DropdownModel',
            _view_name: 'DropdownView',
            button_style: ''
        });
    }
}

export
class DropdownView extends DOMWidgetView {
    initialize(options) {
        this.onKeydown = this._handle_keydown.bind(this);
        this.onDismiss = this._handle_dismiss.bind(this);
        super.initialize(options);
    }

    remove() {
        document.body.removeChild(this.droplist);
        super.remove();
    }

    render() {
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
        this.droplabel.className = 'jupyter-button widget-dropdown-toggle';
        this.buttongroup.appendChild(this.droplabel);

        this.dropbutton = document.createElement('button');
        this.dropbutton.className = 'jupyter-button widget-dropdown-toggle';

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

        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.update_button_style();

        // Set defaults.
        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
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
            _.each(items, function(item: any) {
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

        return super.update(options);
    }

    update_button_style() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        this.update_mapped_classes(class_map, 'button_style', this.droplabel);
        this.update_mapped_classes(class_map, 'button_style', this.dropbutton);
    }

    events(): {[e: string]: string} {
        return {
            'click button.jupyter-button': '_toggle',
            'keydown button.jupyter-button': '_activate'
        }
    }

    /**
     * Handles when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event) {
        event.stopPropagation();
        event.preventDefault();

        // Manually hide the droplist.
        this._toggle();

        var value = event.target.textContent;
        this.model.set('value', value, { updated_view: this });
        this.touch();
    }

    /**
     * Handles browser events that cause a dismissal of the drop list.
     */
    _handle_dismiss(event) {
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
    }

    /**
     * Handles keydown events for navigating the drop list.
     */
    _handle_keydown(event) {
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
    }

    /**
     * Activate the drop list.
     *
     * If the drop button is focused and the user presses enter, up, or down,
     * activate the drop list.
     */
    _activate(event) {
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
    }

    /**
     * Toggle the dropdown list.
     *
     * If the dropdown list doesn't fit below the dropdown label, this will
     * cause the dropdown to be dropped 'up'.
     */
    _toggle() {
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
        var border = parseInt(getComputedStyle(this.droplist).borderWidth, 10);
        availableHeightAbove += border;
        availableHeightBelow -= border;
        var width = buttongroupRect.width;
        var maxHeight = Math.max(availableHeightAbove, availableHeightBelow);
        var top = 0;
        var left = buttongroupRect.left;

        this.droplist.style.left = Math.floor(left) + 'px';
        this.droplist.style.maxHeight = Math.floor(maxHeight) + 'px';
        this.droplist.style.width = Math.floor(width) + 'px';

        // Make drop list visible to compute its dimensions.
        this.droplist.classList.add('mod-active');

        var droplistRect = this.droplist.getBoundingClientRect();

        // If the drop list fits below, render below.
        if (droplistRect.height <= availableHeightBelow) {
            top = buttongroupRect.bottom + border;
            this.droplist.style.top = Math.ceil(top) + 'px';
        // If the drop list fits above, render above.
        } else if (droplistRect.height <= availableHeightAbove) {
            top = buttongroupRect.top - droplistRect.height + border;
            this.droplist.style.top = Math.floor(top) + 'px';
        // Otherwise, render in whichever has more space, above or below.
        } else if (availableHeightBelow >= availableHeightAbove) {
            top = buttongroupRect.bottom + border;
            this.droplist.style.top = Math.ceil(top) + 'px';
        } else {
            top = buttongroupRect.top - droplistRect.height + border;
            this.droplist.style.top = Math.floor(top) + 'px';
        }

        // If a selection is active, scroll to it if necessary.
        if (selectedIndex > -1) {
            scrollIfNeeded(this.droplist, items[selectedIndex]);
        }
    }

    onKeydown: any;
    onDismiss: any;
    droplist: any;
    label: HTMLDivElement;
    buttongroup: HTMLDivElement;
    droplabel: HTMLButtonElement;
    dropbutton: HTMLButtonElement;
    caret: HTMLElement;
}

export
class RadioButtonsModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'RadioButtonsModel',
            _view_name: 'RadioButtonsView',
            tooltips: [],
            icons: [],
            button_style: ''
        });
    }
}


export
class RadioButtonsView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
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
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
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
            _.each(items, function(item: any) {
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
        _.each(items, function(item: any) {
            var item_query = 'input[data-value="' +
                encodeURIComponent(item) + '"]';
            var radio = view.container.querySelectorAll(item_query);
            if (radio.length > 0) {
              var radio_el = radio[0] as HTMLInputElement;
              radio_el.checked = view.model.get('selected_label') === item;
              radio_el.disabled = view.model.get('disabled');
            }
        });
        return super.update(options);
    }

    events(): {[e: string]: string} {
        return {
            'click input[type="radio"]': '_handle_click'
        }
    }

    /**
     * Handle when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click (event) {
        var value = event.target.value;
        this.model.set('selected_label', value, {updated_view: this});
        this.touch();
    }

    label: HTMLDivElement;
    container: HTMLDivElement;
}

export
class ToggleButtonsModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ToggleButtonsModel',
            _view_name: 'ToggleButtonsView'
        });
    }
}


export
class ToggleButtonsView extends DOMWidgetView {
    initialize(options) {
        this._css_state = {};
        super.initialize(options);
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-toggle-buttons');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.el.appendChild(this.buttongroup);

        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
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
            _.each(items, function(item: any, index) {
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
                button.className = 'jupyter-button widget-toggle-button';
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
        _.each(items, function(item: any) {
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
        return super.update(options);
    }

    update_style_traits(button?) {
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
                            (buttons[0] as HTMLInputElement).style[name] = this._css_state[name];
                        }
                    }
                }
            }
        }
    }

    update_button_style() {
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
    }

    events(): {[e: string]: string} {
        return {
            'click button': '_handle_click'
        }
    }

    /**
     * Handle when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click (event) {
        var value = event.target.value;
        this.model.set('value', value, { updated_view: this });
        this.touch();
    }

    private _css_state: any;
    label: HTMLDivElement;
    buttongroup: HTMLDivElement;
}

export
class SelectModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectModel',
            _view_name: 'SelectView'
        });
    }
}

export
class SelectView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-select');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listbox = document.createElement('select');
        this.listbox.style['width'] = '100%';
        this.el.appendChild(this.listbox);

        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
        var view = this;
        var items = this.model.get('_options_labels');
        var selectoptions: any = _.pluck(this.listbox.options, 'value');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (selectoptions[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            // Add items to the DOM.
            this.listbox.textContent = '';

            _.each(items, function(item: any, index) {
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
        return super.update(options);
    }

    events(): {[e: string]: string} {
        return {
            'change select': '_handle_change'
        }
    }

    /**
     * Handle when a new value is selected.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_change() {
        // TODO: typecasting not needed in Typescript 2.0
        // (see https://github.com/Microsoft/TypeScript/issues/9334 and
        // https://github.com/Microsoft/TypeScript/issues/8220)
        var value = (this.listbox.options[this.listbox.selectedIndex] as HTMLOptionElement).value;
        this.model.set('selected_label', value, {updated_view: this});
        this.touch();
    }

    label: HTMLDivElement;
    listbox: HTMLSelectElement;
}

export
class SelectionSliderModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectionSliderModel',
            _view_name: 'SelectionSliderView',
            orientation: 'horizontal',
            readout: true,
            continuous_update: true
        });
    }
}


export
class SelectionSliderView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render () {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-hslider');
        this.el.classList.add('widget-slider');
        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        (this.$slider = $('<div />') as any)
            .slider({
                slide: this.handleSliderChange.bind(this),
                stop: this.handleSliderChanged.bind(this)
            })
            .addClass('slider');

        // Put the slider in a container
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.$slider[0]);
        this.el.appendChild(this.slider_container);

        this.readout = document.createElement('div');
        this.el.appendChild(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.style.display = 'none';

        this.listenTo(this.model, 'change:slider_color', function(sender, value) {
            this.$slider.find('a').css('background', value);
        });
        this.listenTo(this.model, 'change:description', function(sender, value) {
            this.updateDescription();
        });

        this.$slider.find('a').css('background', this.model.get('slider_color'));

        // Set defaults.
        this.update();
        this.updateDescription();
    }

    updateDescription() {
        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
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
                this.el.classList.remove('widget-hslider');
                this.el.classList.remove('widget-hbox');
                this.el.classList.add('widget-vslider');
                this.el.classList.add('widget-vbox');
            } else {
                this.el.classList.remove('widget-vslider');
                this.el.classList.remove('widget-vbox');
                this.el.classList.add('widget-hslider');
                this.el.classList.add('widget-hbox');
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
        return super.update(options);
    }

    events(): {[e: string]: string} {
        return {
            'slide': 'handleSliderChange',
            'slidestop': 'handleSliderChanged'
        }
    }

    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var selected_label = this.model.get('_options_labels')[actual_value];
        this.readout.textContent = selected_label;

        // Only persist the value while sliding if the continuous_update
        // trait is set to true.
        if (this.model.get('continuous_update')) {
            this.handleSliderChanged(e, ui);
        }
    }

    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var selected_label = this.model.get('_options_labels')[actual_value];
        this.readout.textContent = selected_label;
        this.model.set('selected_label', selected_label, {updated_view: this});
        this.touch();
    }

    _validate_slide_value(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         */
        return Math.floor(x);
    }

    label: HTMLDivElement;
    $slider: any;
    slider_container: HTMLDivElement;
    readout: HTMLDivElement;
}

export
class MultipleSelectionModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MultipleSelectionModel',
            selected_labels: []
        });
    }
}


export
class SelectMultipleModel extends MultipleSelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectMultipleModel',
            _view_name: 'SelectMultipleView'
        });
    }
}

export
class SelectMultipleView extends SelectView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.remove('widget-select');
        this.el.classList.add('widget-select-multiple');
        this.listbox.multiple = true;
        this.update();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        super.update();
        var selected = this.model.get('value') || [];
        var values = _.map(selected, encodeURIComponent);
        var options = this.listbox.options;
        for (var i = 0, len = options.length; i < len; ++i) {
            var value = options[i].getAttribute('data-value');
            // TODO: typecasting not needed in Typescript 2.0
            // (see https://github.com/Microsoft/TypeScript/issues/9334 and
            // https://github.com/Microsoft/TypeScript/issues/8220)
            (options[i] as HTMLOptionElement).selected = _.contains(values, value);
        }
    }

    events(): {[e: string]: string} {
        return {
            'change select': '_handle_change'
        }
    }

    /**
     * Handle when a new value is selected.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_change() {
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
}
