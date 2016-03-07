// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var $ = require('./jquery');
var _ = require('underscore');

var SelectionModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'SelectionModel',
        selected_label: '',
        _options_labels: [],
        disabled: false,
        description: ''
    }),
});

var DropdownModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'DropdownModel',
        _view_name: 'DropdownView',
        button_style: ''
    }),
});

var DropdownView = widget.DOMWidgetView.extend({
    render : function() {
        var view = this;
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-dropdown');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.buttongroup.className = 'widget_item btn-group';
        this.el.appendChild(this.buttongroup);

        this.droplabel = document.createElement('button');
        this.droplabel.className = 'btn btn-default widget-combo-btn';
        this.droplabel.innerHTML = '&nbsp;';
        this.buttongroup.appendChild(this.droplabel);

        this.dropbutton = document.createElement('button');
        this.dropbutton.className = 'btn btn-default';
        this.dropbutton.classList.add('dropdown-toggle');
        this.dropbutton.classList.add('widget-combo-carrot-btn');
        this.dropbutton.setAttribute('data-toggle', 'dropdown');
        this.dropbutton.onclick = view._showDropdown.bind(view);
        var caret = document.createElement('span');
        caret.classList.add('caret');
        this.dropbutton.appendChild(caret);
        this.buttongroup.appendChild(this.dropbutton);

        this.droplist = document.createElement('ul');
        this.droplist.classList.add('dropdown-menu');
        this.buttongroup.appendChild(this.droplist);

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update_button_style();

        // Set defaults.
        this.update();
    },

    /**
     * Show the dropdown list.
     *
     * If the dropdown list doesn't fit below the dropdown label, this will
     * cause the dropdown to be dropped 'up'.
     * @param  {Event} e
     */
    _showDropdown: function(e) {
        // Don't allow bootstrap to show the dropdown!
        e.stopImmediatePropagation();
        e.preventDefault();

        // Get the bottom of the dropdown label, and the bottom of the nb body.
        // The difference is the maximum height of the dropmenu when displayed
        // below the button.
        var droplabelRect = this.droplabel.getBoundingClientRect();
        var parent = this.droplabel.parentNode;
        while (parent.parentNode) {
          parent = parent.parentNode;
        }
        var bodyRect = parent.body.getBoundingClientRect();
        var maxHeight = bodyRect.bottom - droplabelRect.bottom;

        // If the maximum height of the dropdown's space is less than the
        // height of the dropdown itself, make it drop up!
        if (maxHeight < 200) {
            this.buttongroup.classList.add('dropup');
        } else {
            this.buttongroup.classList.remove('dropup');
        }

        // Show the dropdown(or up)
        this.dropbutton.dropdown('toggle');
    },

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */

        if (options === undefined || options.updated_view != this) {
            var selected_item_text = this.model.get('selected_label');
            if (selected_item_text.trim().length === 0) {
                this.droplabel.innerHTML = '&nbsp;';
            } else {
                this.droplabel.textContent = selected_item_text;
            }

            var items = this.model.get('_options_labels');
            var replace_droplist = document.createElement('ul');
            replace_droplist.classList.add('dropdown-menu');

            // Copy the style
            replace_droplist.setAttribute('style', this.droplist.style);
            var that = this;
            _.each(items, function(item, i) {
                var item_button = document.createElement('a');
                item_button.textContent = item;
                item_button.onclick = () => { that.handle_click(); };

                var btn_li = document.createElement('li');
                btn_li.appendChild(item_button);
                replace_droplist.appendChild(btn_li);
            });

            var parent = this.droplist.parentNode;
            this.droplist = parent.replaceChild(replace_droplist, this.droplist);

            var disabled = this.model.get('disabled');
            this.buttongroup.disabled = disabled;
            this.droplabel.disabled = disabled;
            this.dropbutton.disabled = disabled;
            this.droplist.disabled = disabled;

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return DropdownView.__super__.update.apply(this);
    },

    update_button_style: function() {
        var class_map = {
            primary: ['btn-primary'],
            success: ['btn-success'],
            info: ['btn-info'],
            warning: ['btn-warning'],
            danger: ['btn-danger']
        };
        this.update_mapped_classes(class_map, 'button_style', this.droplabel);
        this.update_mapped_classes(class_map, 'button_style', this.dropbutton);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name.substring(0, 6) == 'border' || name == 'background' || name == 'color') {
            this.droplabel.style[name] = value;
            this.dropbutton.style[name] = value;
            this.droplist.style[name] = value;
        } else {
            this.el.style[name] = value;
        }
    },

    handle_click: function (e) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set(
            'selected_label',
            document.querySelectorAll(e.target).textContent,
            { updated_view: this }
        );
        this.touch();

        // Manually hide the droplist.
        e.stopPropagation();
        e.preventDefault();
        this.buttongroup.classList.remove('open');
    },

});

var RadioButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'RadioButtonsModel',
        _view_name: 'RadioButtonsView',
        tooltips: [],
        icons: [],
        button_style: ''
    }),
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

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            // Add missing items to the DOM.
            var items = this.model.get('_options_labels');
            var disabled = this.model.get('disabled');
            var that = this;
            _.each(items, function(item, index) {
                var item_query = 'input[data-value="' + encodeURIComponent(item) + '"]';
                if (that.el.querySelectorAll(item_query).length === 0) {
                    var label = document.createElement('label');
                    label.classList.add('radio');
                    label.textContent = item;
                    that.container.appendChild(label);

                    var radio = document.createElement('input');
                    radio.setAttribute('type', 'radio');
                    radio.classList.add(that.model);
                    radio.value = item;
                    radio.setAttribute('data-value', encodeURIComponent(item));
                    that.label.appendChild(radio);
                    radio.onclick = function() { that.handle_click(); };
                }

                var item_elements = that.container.getElementsByClassName(item_query);
                if (item_elements.length > 0) {
                  let item_el = item_elements[0];

                  if (that.model.get('selected_label') == item) {
                      item_el.prop('checked', true);
                  } else {
                      item_el.prop('checked', false);
                  }
                  item_el.prop('disabled', disabled);
                }

            });

            // Remove items that no longer exist.
            this.container.getElementsByClassName('input').forEach(function(i, obj) {
                var value = obj.value;
                var found = false;
                _.each(items, function(item, index) {
                    if (item == value) {
                        found = true;
                        return false;
                    }
                });

                if (!found) {
                    $(obj).parent().remove();

                }
            });

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.label.textContent = description;
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return RadioButtonsView.__super__.update.apply(this);
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

    handle_click: function (e) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set('selected_label', $(e.target).val(), {updated_view: this});
        this.touch();
    },
});

var ToggleButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'ToggleButtonsModel',
        _view_name: 'ToggleButtonsView'
    }),
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
        this.buttongroup.className = 'btn-group';
        this.el.appendChild(this.buttongroup);

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update_button_style();
        this.update();
    },

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            // Add missing items to the DOM.
            var items = this.model.get('_options_labels');
            var icons = this.model.get('icons');
            var previous_icons = this.model.previous('icons') || [];
            var disabled = this.model.get('disabled');
            var that = this;
            var item_html;
            _.each(items, function(item, index) {
                if (item.trim().length === 0 && (!icons[index] ||
                    icons[index].trim().length === 0)) {
                    item_html = '&nbsp;';
                } else {
                    item_html = utils.escape_html(item);
                }
                var item_query = '[data-value="' + encodeURIComponent(item) + '"]';
                var item_elements = that.buttongroup.getElementsByClassName(item_query);

                if (item_elements.length > 0) {
                  var icon_element = item_elements[0].getElementsByClassName('.fa');

                  var item_el = document.createElement('button');
                  item_el.setAttribute('type', 'button');
                  item_el.className = 'btn btn-default';
                  item_el.innerHTML = item_html;
                  that.buttongroup.appendChild(item_el);
                  item_el.setAttribute('data-value', encodeURIComponent(item));
                  item_el.setAttribute('data-toggle', 'tooltip');
                  item_el.setAttribute('value', item);
                  item_el.onclick = () => { that.handle_click.bind(that); };
                  that.update_style_traits(item_el);
                  icon_element = document.createElement('i');
                  item_el.appendChild(icon_element);
                }

                if (that.model.get('selected_label') == item) {
                    item_el.classList.add('active');
                } else {
                    item_el.classList.add('active');
                }

                item_el.disabled = disabled;
                item_el.setAttribute('title', that.model.get('tooltips')[index]);

                icon_element.classList.remove(previous_icons[index]);
                icon_element.classList.add(icons[index]);
            });

            // Remove items that no longer exist.
            this.$buttongroup.find('button').each(function(i, obj) {
                var value = $(obj).attr('value');
                var found = false;
                _.each(items, function(item, index) {
                    if (item == value) {
                        found = true;
                        return false;
                    }
                });

                if (!found) {
                    $(obj).remove();
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
        }
        return ToggleButtonsView.__super__.update.apply(this);
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
                if (name == 'margin') {
                    this.buttongroup.style[name] = this._css_state[name];
                } else if (name != 'width') {
                    if (button) {
                        button.style[name] = this._css_state[name];
                    } else {
                        var btns = this.buttongroup.getElementsByClassName('button');
                        if (btns.length) {
                          btns[0].style[name] = this._css_state[name];
                        }
                    }
                }
            }
        }
    },

    update_button_style: function() {
        var class_map = {
            primary: ['btn-primary'],
            success: ['btn-success'],
            info: ['btn-info'],
            warning: ['btn-warning'],
            danger: ['btn-danger']
        };
        this.update_mapped_classes(
          class_map,
          'button_style',
          this.buttongroup.getElementsByClassName('button')[0]
        );
    },

    handle_click: function (e) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set('selected_label', $(e.target).attr('value'), {updated_view: this});
        this.touch();
    },
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
                    .getElementsByClassName(item_query).length === 0;
                var option;
                if (item_exists) {
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
        return SelectView.__super__.update.apply(this);
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
        readout: true
    }),
});

var SelectionSliderView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-hslider');

        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        this.slider = document.createElement('input');
        this.slider.setAttribute('type', 'range');
        this.slider.classList.add('slider'); // TODO - is this necessary.

        // Put the slider in a container
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.slider);
        this.el.appendChild(this.slider_container);

        this.readout = document.createElement('div');
        this.el.appendChild(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.style.display = 'none';

        this.listenTo(this.model, 'change:slider_color', function(sender, value) {
            var a_items = this.slider.getElementsByClassName('a');
            if (a_items.length) {
              a_items[0].style.background = value;
            }
        }, this);
        this.listenTo(this.model, 'change:description', function(sender, value) {
            this.updateDescription();
        }, this);

        var a_items = this.slider.getElementsByClassName('a');
        if (a_items.length) {
          a_items[0].style.background = value;
        }

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
            var slider_items = this.slider.getElementsByClassName('a');
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
            // this.$slider.slider('option', 'step', 1); // DW TODO
            // this.$slider.slider('option', 'max', max); // DW TODO
            // this.$slider.slider('option', 'min', min); // DW TODO

            // WORKAROUND FOR JQUERY SLIDER BUG.
            // The horizontal position of the slider handle
            // depends on the value of the slider at the time
            // of orientation change.  Before applying the new
            // workaround, we set the value to the minimum to
            // make sure that the horizontal placement of the
            // handle in the vertical slider is always
            // consistent.
            var orientation = this.model.get('orientation');
            // this.$slider.slider('option', 'value', min); // DW TODO
            // this.$slider.slider('option', 'orientation', orientation); // DW TODO

            var selected_label = this.model.get('selected_label');
            var index = labels.indexOf(selected_label);
            // this.$slider.slider('option', 'value', index);

            // this.$readout.text(selected_label);
            this.readout.textContent = selected_label;

            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation=='vertical') {
                // this.$el
                //     .removeClass('widget-hslider')
                //     .addClass('widget-vslider');
                this.el.classList.remove('widget-hslider');
                this.el.classList.add('widget-vslider');

                // this.$el
                //     .removeClass('widget-hbox')
                //     .addClass('widget-vbox');
              this.el.classList.remove('widget-hbox');
              this.el.classList.add('widget-vbox');

            } else {
                // this.$el
                //     .removeClass('widget-vslider')
                //     .addClass('widget-hslider');
                this.el.classList.remove('widget-vslider');
                this.el.classList.add('widget-hslider');

                // this.$el
                //     .removeClass('widget-vbox')
                //     .addClass('widget-hbox');
                this.el.classList.remove('widget-vbox');
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
        return SelectionSliderView.__super__.update.apply(this);
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
        // this.$readout.text(selected_label);
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
        // this.$readout.text(selected_label);
        this.readout.textContent = selected_label;
        this.model.set('selected_label', selected_label, {updated_view: this});
        this.touch();
    },

    _validate_slide_value: function(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         *
         * Double bit-wise not truncates the decimal (int cast).
         */
        return Math.floor(x);
    },
});

var MultipleSelectionModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'MultipleSelectionModel',
        selected_labels: []
    }),
});

var SelectMultipleModel = MultipleSelectionModel.extend({
    defaults: _.extend({}, MultipleSelectionModel.prototype.defaults, {
        _model_name: 'SelectMultipleModel',
        _view_name: 'SelectMultipleView'
    }),
});

var SelectMultipleView = SelectView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        SelectMultipleView.__super__.render.apply(this);
        this.el.classList.remove('widget-select');
        this.el.classList.add('widget-select-multiple');

        this.listbox.setAttribute('multiple', true);
        this.listbox.onchange = () => { this.handle_change.bind(this); };

        // set selected labels *after* setting the listbox to be multiple selection
        this.listbox.value = this.model.get('selected_labels');
        return this;
    },

    update: function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        SelectMultipleView.__super__.update.apply(this, arguments);
        this.listbox.value = this.model.get('selected_labels');
    },

    handle_click: function() {
        /**
         * Overload click from select
         *
         * Apparently it's needed from there for testing purposes,
         * but breaks behavior of this.
         */
    },

    handle_change: function (e) {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */

        // $listbox.val() returns a list of string.  In order to preserve
        // type information correctly, we need to map the selected indices
        // to the options list.
        var items = this.model.get('_options_labels');
        var values = Array.prototype.map.call(this.listbox.selectedOptions || [], function(option) {
            return items[option.index];
        });

        this.model.set('selected_labels',
            values,
            {updated_view: this});
        this.touch();
    },
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
