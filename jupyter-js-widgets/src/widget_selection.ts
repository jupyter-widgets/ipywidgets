// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreLabeledDOMWidgetModel,
} from './widget_core';

import {
    LabeledDOMWidgetView, unpack_models, ViewList
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
class SelectionModel extends CoreLabeledDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectionModel',
            value: '',
            _options_labels: [],
            disabled: false,
        });
    }
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
class SelectView extends LabeledDOMWidgetView {
    /**
     * Public constructor.
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.listenTo(this.model, 'change:_options_labels', () => this._updateOptions());
    }

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-select');

        this.listbox = document.createElement('select');
        this.el.appendChild(this.listbox);
        this._updateOptions();
        this.update();
    }

    /**
     * Update the contents of this view
     */
    update() {
        // Disable listbox if needed
        this.listbox.disabled = this.model.get('disabled');

        // Select the correct element
        var value = this.model.get('value');
        this.listbox.selectedIndex = this.model.get('_options_labels').indexOf(value);
        return super.update();
    }

    _updateOptions() {
        this.listbox.textContent = '';
        let items = this.model.get('_options_labels');
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let option = document.createElement('option');
            option.textContent = item.replace(/ /g, '\xa0'); // space -> &nbsp;
            option.setAttribute('data-value', encodeURIComponent(item));
            option.value = item;
            this.listbox.appendChild(option);
        }
    }

    events(): {[e: string]: string} {
        return {
            'change select': '_handle_change'
        }
    }

    /**
     * Handle when a new value is selected.
     */
    _handle_change() {
        // Don't use [] indexing to work around https://github.com/Microsoft/TypeScript/issues/14522
        let value = this.listbox.options.item(this.listbox.selectedIndex).value;
        this.model.set('value', value);
        this.touch();
    }

    listbox: HTMLSelectElement;
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

// TODO: Make a phosphor dropdown control, wrapped in DropdownView. Also, fix
// bugs in keyboard handling. See
// https://github.com/jupyter-widgets/ipywidgets/issues/1055 and
// https://github.com/jupyter-widgets/ipywidgets/issues/1049
// For now, we subclass SelectView to provide DropdownView
// For the old code, see commit f68bfbc566f3a78a8f3350b438db8ed523ce3642
export
class DropdownView extends SelectView {}

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
class RadioButtonsView extends LabeledDOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-radio');

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
        _.each(items, function(item: any) {
            var item_query = 'input[data-value="' +
                encodeURIComponent(item) + '"]';
            var radio = view.container.querySelectorAll(item_query);
            if (radio.length > 0) {
              var radio_el = radio[0] as HTMLInputElement;
              radio_el.checked = view.model.get('value') === item;
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
        this.model.set('value', value, {updated_view: this});
        this.touch();
    }

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
class ToggleButtonsView extends LabeledDOMWidgetView {
    initialize(options) {
        this._css_state = {};
        super.initialize(options);
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
    }

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-toggle-buttons');

        this.buttongroup = document.createElement('div');
        this.el.appendChild(this.buttongroup);

        this.update();
        this.set_button_style();
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
        var previous_bstyle = ToggleButtonsView.classMap[this.model.previous('button_style')] || '';
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
            _.each(items, (item: any, index) => {
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
                button.className = 'widget-toggle-button jupyter-button';
                if (previous_bstyle) {
                    button.classList.add(previous_bstyle);
                }
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
        var buttons = this.buttongroup.querySelectorAll('button');
        _.each(buttons, (button) => {
            this.update_mapped_classes(ToggleButtonsView.classMap, 'button_style', button);
        });
    }

    set_button_style() {
        var buttons = this.buttongroup.querySelectorAll('button');
        _.each(buttons, (button) => {
            this.set_mapped_classes(ToggleButtonsView.classMap, 'button_style', button);
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
    buttongroup: HTMLDivElement;
}

export
namespace ToggleButtonsView {
    export
    const classMap = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
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
class SelectionSliderView extends LabeledDOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render () {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-hslider');
        this.el.classList.add('widget-slider');

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

        this.listenTo(this.model, 'change:slider_color', (sender, value) => {
            this.$slider.find('a').css('background', value);
        });

        this.$slider.find('a').css('background', this.model.get('slider_color'));

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
                this.el.classList.remove('widget-inline-hbox');
                this.el.classList.add('widget-vslider');
                this.el.classList.add('widget-inline-vbox');
            } else {
                this.el.classList.remove('widget-vslider');
                this.el.classList.remove('widget-inline-vbox');
                this.el.classList.add('widget-hslider');
                this.el.classList.add('widget-inline-hbox');
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
        this.model.set('value', selected_label, {updated_view: this});
        this.touch();
    }

    _validate_slide_value(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         */
        return Math.floor(x);
    }

    $slider: any;
    slider_container: HTMLDivElement;
    readout: HTMLDivElement;
}

export
class MultipleSelectionModel extends SelectionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MultipleSelectionModel',
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
class SelectMultipleView extends LabeledDOMWidgetView {
    /**
     * Public constructor.
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.listenTo(this.model, 'change:_options_labels', () => this._updateOptions());
    }

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-select-multiple');

        this.listbox = document.createElement('select');
        this.listbox.multiple = true;
        this.el.appendChild(this.listbox);
        this._updateOptions();
        this.update();
    }

    /**
     * Update the contents of this view
     */
    update() {
        super.update();
        this.listbox.disabled = this.model.get('disabled');

        // Set selected values
        let selected = this.model.get('value') || [];
        let values = _.map(selected, encodeURIComponent);
        let options = this.listbox.options;
        for (let i = 0, len = options.length; i < len; ++i) {
            // Don't use [] indexing to work around https://github.com/Microsoft/TypeScript/issues/14522
            let option = options.item(i);
            let value = option.getAttribute('data-value');
            option.selected = _.contains(values, value);
        }
    }

    _updateOptions() {
        this.listbox.textContent = '';
        let items = this.model.get('_options_labels');
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let option = document.createElement('option');
            option.textContent = item.replace(/ /g, '\xa0'); // space -> &nbsp;
            option.setAttribute('data-value', encodeURIComponent(item));
            option.value = item;
            this.listbox.appendChild(option);
        }
    }

    events(): {[e: string]: string} {
        return {
            'change select': '_handle_change'
        }
    }

    /**
     * Handle when a new value is selected.
     */
    _handle_change() {
        // In order to preserve type information correctly, we need to map
        // the selected indices to the options list.
        let items = this.model.get('_options_labels');
        let values = Array.prototype.map
            .call(this.listbox.selectedOptions || [], function(option) {
                return items[option.index];
            });
        this.model.set('value', values);
        this.touch();
    }

    listbox: HTMLSelectElement;
}
