// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var widget = require("./widget");
var utils = require("./utils");
// var $ = require("./jquery");
var _ = require("underscore");

var SelectionModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: "SelectionModel",
        value: "",
        _options_labels: [],
        disabled: false,
        description: "",
    }),
});

var DropdownModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "DropdownModel",
        _view_name: "DropdownView",
        button_style: ""
    }),
});

var DropdownView = widget.DOMWidgetView.extend({
    render : function() {
        // this.$el
        //     .addClass('jupyter-widgets widget-hbox widget-dropdown');
        this.el.classList.add('jupyter-widgets widget-hbox widget-dropdown');

        // this.$label = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-label')
        //     .hide();
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.classList.add('widget-label');
        this.label.style.visibility = 'hidden';

        // this.$buttongroup = $('<div />')
        //     .addClass('widget_item')
        //     .addClass('btn-group')
        //     .appendTo(this.$el);
        this.buttongroup = document.createElement('div');
        this.buttongroup.classList.add('widget_item');
        this.buttongroup.classList.add('btn-group');
        this.el.appendChild(this.buttongroup);

        // this.$droplabel = $('<button />')
        //     .addClass('btn btn-default')
        //     .addClass('widget-combo-btn')
        //     .html("&nbsp;")
        //     .appendTo(this.$buttongroup);
        this.droplabel = document.createElement('button');
        this.droplabel.classList.add('btn btn-default');
        this.droplabel.classList.add('widget-combo-btn');
        this.droplabel.innerHTML = "&nbsp;";
        this.buttongroup.appendChild(this.droplabel);

        // this.$dropbutton = $('<button />')
        //     .addClass('btn btn-default')
        //     .addClass('dropdown-toggle')
        //     .addClass('widget-combo-carrot-btn')
        //     .attr('data-toggle', 'dropdown')
        //     .click(this._showDropdown.bind(this))
        //     .append($('<span />').addClass("caret"))
        //     .appendTo(this.$buttongroup);
        this.dropbutton = document.createElement('button');
        this.dropbutton.classList.add('btn btn-default');
        this.dropbutton.classList.add('dropdown-toggle');
        this.dropbutton.classList.add('widget-combo-carrot-btn');
        this.dropbutton.setAttribute('data-toggle', 'dropdown');
        this.dropbutton.onclick = () => {this._showDropdown.bind(this); };
        var caret = document.createElement('span');
        caret.classList.add('caret');
        this.dropbutton.appendChild(caret);
        this.buttongroup.appendChild(this.dropbutton);
        //
        // this.$droplist = $('<ul />')
        //     .addClass('dropdown-menu')
        //     .appendTo(this.$buttongroup);
        this.droplist = document.createElement('ul');
        this.droplist.classList.add('dropdown-menu');
        this.buttongroup.appendChild(this.droplist);

        this.listenTo(this.model, "change:button_style", this.update_button_style, this);
        this.update_button_style();

        // Set defaults.
        this.update();
    },

    /**
     * Show the dropdown list.
     *
     * If the dropdown list doesn't fit below the dropdown label, this will
     * cause the dropdown to be dropped "up".
     * @param  {Event} e
     */
    _showDropdown: function(e) {
        // Don't allow bootstrap to show the dropdown!
        e.stopImmediatePropagation();
        e.preventDefault();

        // Get the bottom of the dropdown label, and the bottom of the nb body.
        // The difference is the maximum height of the dropmenu when displayed
        // below the button.

        // var droplabelRect = this.$droplabel[0].getBoundingClientRect();
        var droplabelRect = this.droplabel.getBoundingClientRect();

        var parent = this.$droplabel[0].parentNode;
        while (parent.parentNode) parent = parent.parentNode;
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
            var selected_item_text = this.model.get('value');
            if (selected_item_text.trim().length === 0) {
                // this.$droplabel.html("&nbsp;");
                this.droplabel.innerHTML = "&nbsp;";
            } else {
                // this.$droplabel.text(selected_item_text);
                this.droplabel.innerText = selected_item_text;
            }

            var items = this.model.get('_options_labels');
            // var $replace_droplist = $('<ul />')
            //     .addClass('dropdown-menu');
            var replace_droplist = document.createElement(ul);
            replace_droplist.classList.add('dropdown-menu');

            // Copy the style
            // $replace_droplist.attr('style', this.$droplist.attr('style'));
            replace_droplist.setAttribute('style', this.droplist.style);
            var that = this;
            _.each(items, function(item, i) {
                // var item_button = $('<a href="#"/>')
                //     .text(item)
                //     .on('click', $.proxy(that.handle_click, that));
                var item_button = document.createElement('a');
                item_button.innerText = item;
                item_button.onclick = () => { that.handle_click(); }; // TODO - confirm.

                // $replace_droplist.append($('<li />').append(item_button));
                var btn_li = document.createElement('li');
                btn_li.appendChild(item_button);
                replace_droplist.appendChild(btn_li);
            });


            this.$droplist.replaceWith($replace_droplist);
            var parent = this.droplist.parentNode;
            parent.replaceChild(replace_droplist, this.droplist);

            // this.$droplist.remove();
            parent.removeChild(this.droplist);

            this.droplist = replace_droplist;

            if (this.model.get('disabled')) {
                this.buttongroup.setAttribute('disabled','disabled');
                this.droplabel.setAttribute('disabled','disabled');
                this.dropbutton.setAttribute('disabled','disabled');
                this.droplist.setAttribute('disabled','disabled');
            } else {
                this.buttongroup.setAttribute('disabled');
                this.droplabel.setAttribute('disabled');
                this.dropbutton.setAttribute('disabled');
                this.droplist.setAttribute('disabled');
            }

            var description = this.model.get('description');
            if (description.length === 0) {
                // this.$label.hide();
                this.label.style.visibility = 'hidden';
            } else {
                // this.typeset(this.$label, description);
                this.typeset(this.label, description);

                // this.$label.show();
                this.label.style.visibility = 'visible';
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
            // this.$droplabel.css(name, value);
            this.droplabel.style[name] = value;

            // this.$dropbutton.css(name, value);
            this.dropbutton.style[name] = value;

            // this.$droplist.css(name, value);
            this.droplist.style[name] = value;
        } else {
            // this.$el.css(name, value);
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
        // this.model.set('value', $(e.target).text(), {updated_view: this});
        this.model.set(
            'value',
            document.querySelectorAll(e.target).innerText,
            { updated_view: this }
        );
        this.touch();

        // Manually hide the droplist.
        e.stopPropagation();
        e.preventDefault();
        // this.$buttongroup.removeClass('open');
        this.buttongroup.classList.remove('open');
    },

});

var RadioButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "RadioButtonsModel",
        _view_name: "RadioButtonsView",
        tooltips: [],
        icons: [],
        button_style: ""
    }),
});

var RadioButtonsView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        // this.$el
        //     .addClass('jupyter-widgets widget-hbox widget-radio');
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-radio');

        // this.$label = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-label')
        //     .hide();
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.classList.add('widget-label');
        this.label.style.visibility = 'hidden';

        // this.$container = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-radio-box');
        this.container = document.createElement('div');
        this.el.appendChild(this.el);
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
                var item_query = ' :input[data-value="' + encodeURIComponent(item) + '"]';
                // if (that.$el.find(item_query).length === 0) {
                if (that.el.getElementsByClassName(item_query).length === 0) {
                    // var $label = $('<label />')
                    //     .addClass('radio')
                    //     .text(item)
                    //     .appendTo(that.$container);
                    var label = document.createElement('label');
                    label.classList.add('radio');
                    label.innerText = item;
                    that.container.appendChild(label);

                    // $('<input />')
                    //     .attr('type', 'radio')
                    //     .addClass(that.model)
                    //     .val(item)
                    //     .attr('data-value', encodeURIComponent(item))
                    //     .prependTo($label)
                    //     .on('click', $.proxy(that.handle_click, that));
                    var radio = document.createElement('input');
                    radio.setAttribute('type', 'radio');
                    radio.classList.add(that.model);
                    radio.value = item;
                    radio.setAttribute('data-value', encodeURIComponent(item));
                    that.label.appendChild(radio);
                    radio.onclick = () => { that.handle_click(); };
                }

                // var $item_element = that.$container.find(item_query);
                var item_elements = that.container.getElementsByClassName(item_query);
                if (item_elements.length > 0) {
                  let item_el = item_elements[0];

                  if (that.model.get('value') == item) {
                      item_el.prop('checked', true);
                  } else {
                      item_el.prop('checked', false);
                  }
                  item_el.prop('disabled', disabled);
                }

            });

            // Remove items that no longer exist.
            // this.$container.find('input').each(function(i, obj) {
            this.container.getElementsByClassName('input').forEach(function(i, obj) {
                // var value = $(obj).val();
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
                this.$label.hide();
            } else {
                this.$label.text(description);
                this.typeset(this.$label, description);
                this.$label.show();
            }
        }
        return RadioButtonsView.__super__.update.apply(this);
    },

    update_attr: function(name, value) {
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.$el.css(name, value);
        } else {
            this.$container.css(name, value);
        }
    },

    handle_click: function (e) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        this.model.set('value', $(e.target).val(), {updated_view: this});
        this.touch();
    },
});

var ToggleButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "ToggleButtonsModel",
        _view_name: "ToggleButtonsView",
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
        // this.$el
        //     .addClass('jupyter-widgets widget-hbox widget-toggle-buttons');
        this.el.classList.add('jupyter-widgets widgets-hbox widget-toggle-buttons');

        // this.$label = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-label')
        //     .hide();
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.classList.add('widget-label');
        this.label.style.visibility = 'hidden';

        // this.$buttongroup = $('<div />')
        //     .addClass('btn-group')
        //     .appendTo(this.$el);
        this.buttongroup = document.createElement('div');
        this.buttongroup.classList.add('btn-group');
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
                    item_html = "&nbsp;";
                } else {
                    item_html = utils.escape_html(item);
                }
                var item_query = '[data-value="' + encodeURIComponent(item) + '"]';

                // var $item_element = that.$buttongroup.find(item_query);
                var item_elements = that.buttongroup.getElementsByClassName(item_query);

                // var $icon_element = $item_element.find('.fa');
                if (item_elements.length > 0) {
                  var icon_element = item_elements[0].getElementsByClassName('.fa');

                  // if (!$item_element.length) {
                  // $item_element = $('<button/>')
                  //     .attr('type', 'button')
                  //     .addClass('btn btn-default')
                  //     .html(item_html)
                  //     .appendTo(that.$buttongroup)
                  //     .attr('data-value', encodeURIComponent(item))
                  //     .attr('data-toggle', 'tooltip')
                  //     .attr('value', item)
                  //     .on('click', $.proxy(that.handle_click, that));
                  // that.update_style_traits($item_element);
                  // $icon_element = $('<i class="fa"></i>').prependTo($item_element);
                  // }

                  var item_el = document.createElement('button');
                  item_el.setAttribute('type', 'button');
                  item_el.classList.add('btn btn-default');
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

                if (that.model.get('value') == item) {
                    // $item_element.addClass('active');
                    item_el.classList.add('active');
                } else {
                    // $item_element.removeClass('active');
                    item_el.classList.add('active');
                }

                // $item_element.prop('disabled', disabled);
                item_el.setAttribute('disabled', disabled);

                // $item_element.attr('title', that.model.get('tooltips')[index]);
                item_el.setAttribute('title', that.model.get('tooltips')[index]);

                // $icon_element
                //     .removeClass(previous_icons[index])
                //     .addClass(icons[index]);
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
                // this.$label.hide();
                this.label.style.visibility = 'hidden';
            } else {
                // this.$label.text();
                this.label.innerText = '';

                // this.typeset(this.$label, description);
                this.typeset(this.label, description);

                // this.$label.show();
                this.label.style.visibility = 'visible';
            }
        }
        return ToggleButtonsView.__super__.update.apply(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            // this.$el.css(name, value);
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
                    // this.$buttongroup.css(name, this._css_state[name]);
                    this.buttongroup.style[name] = this._css_state[name];
                } else if (name != 'width') {
                    if (button) {
                        // button.css(name, this._css_state[name]);
                        button.style[name] = this._css_state[name];
                    } else {
                        // this.$buttongroup.find('button').css(name, this._css_state[name]);
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
        this.model.set('value', $(e.target).attr('value'), {updated_view: this});
        this.touch();
    },
});

var SelectModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "SelectModel",
        _view_name: "SelectView",
    }),
});

var SelectView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        // this.$el
        //     .addClass('jupyter-widgets widget-hbox widget-select');
        this.el.classList.add('jupyter-widgets widget-hbox widget-select');

        // this.$label = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-label')
        //     .hide();
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.el.classList.ad('widget-label');
        this.el.style.visibility = 'hidden';

        // this.$listbox = $('<select />')
        //     .addClass('widget-listbox form-control')
        //     .attr('size', 6)
        //     .appendTo(this.$el)
        //     .on('change', $.proxy(this.handle_change, this));
        this.listbox = document.createElement('select');
        this.listbox.classList.add('widget-listbox form-control');
        this.listbox.setAttribute('size', 6);
        this.el.appendChild(this.listbox);
        this.el.onchange = () => { this.handle_change.bind(this); };

        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            // Add missing items to the DOM.
            var items = this.model.get('_options_labels');
            var that = this;
            _.each(items, function(item, index) {
               var item_query = 'option[data-value="' + encodeURIComponent(item) + '"]';
                if (that.listbox.getElementsByClassName(item_query).length === 0) {
                    // $('<option />')
                    //     .text(item.replace ? item.replace(/ /g, '\xa0') : item) // replace string spaces with &nbsp; for correct rendering
                    //     .attr('data-value', encodeURIComponent(item))
                    //     .val(item)
                    //     .on("click", $.proxy(that.handle_click, that))
                    //     .appendTo(that.$listbox);
                    var option = document.createElement('option');
                    option.innerText = item.replace ? item.replace(/ /g, '\xa0') : item;
                    option.setAttribute('data-value', encodeURIComponent(item));
                    option.value = item;
                    option.onclick = () => {that.handle_click.bind(that); };
                    that.listbox.appendChild(option);
                }
            });

            // Select the correct element
            // this.$listbox.val(this.model.get('value'));
            this.listbox.value = this.model.get('value');

            // Disable listbox if needed
            var disabled = this.model.get('disabled');

            // this.$listbox.prop('disabled', disabled);
            this.listbox.setAttribute('disabled', disabled);

            // Remove items that no longer exist.
            this.$listbox.find('option').each(function(i, obj) {
                var value = $(obj).val();
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
                // this.$label.hide();
                this.label.style.visibility = 'hidden';
            } else {
                this.typeset(this.$label, description);
                // this.$label.show();
                this.label.style.visibility = 'visible';
            }
        }
        return SelectView.__super__.update.apply(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            // this.$el.css(name, value);
            this.el.style[name] = value;
        } else {
            // this.$listbox.css(name, value);
            this.listbox.style[name] = value;
        }
    },

    handle_click: function (e) {
        /**
         * Handle when a new value is clicked.
         */
        this.$listbox.val($(e.target).val()).change(); // TODO
    },

    handle_change: function (e) {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        // this.model.set('value', this.$listbox.val(), {updated_view: this});
        this.model.set('value', this.listbox.value, {updated_view: this});
        this.touch();
    },
});

var SelectionSliderModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "SelectionSliderModel",
        _view_name: "SelectionSliderView",
        orientation: "horizontal",
        readout: true
    }),
});

var SelectionSliderView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        // this.$el
        //     .addClass('jupyter-widgets widget-hbox widget-hslider');

        this.el.classList.add('jupyter-widgets widget-hbox widget-hslider');

        // this.$label = $('<div />')
        //     .appendTo(this.$el)
        //     .addClass('widget-label')
        //     .hide();
        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.classList.add('widget-label');
        this.label.style.visibility = 'hidden';

        // this.$slider = $('<div />')
        //     .slider({})
        //     .addClass('slider');
        this.slider = document.createElement('input');
        this.slider.setAttribute('type', 'range');
        this.slider.classList.add('slider'); // TODO - is this necessary.


        // Put the slider in a container
        // this.$slider_container = $('<div />')
        //     .addClass('slider-container')
        //     .append(this.$slider);
        // this.$el.append(this.$slider_container);
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.slider);
        this.el.appendChild(this.slider_container);

        // this.$readout = $('<div/>')
        //     .appendTo(this.$el)
        //     .addClass('widget-readout')
        //     .hide();
        this.readout = document.createElement('div');
        this.el.appendChild(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.style.visibility = 'hidden';

        this.listenTo(this.model, 'change:slider_color', function(sender, value) {
            // this.$slider.find('a').css('background', value);
            var a_items = this.slider.getElementsByClassName('a');
            if (a_items.length) {
              a_items[0].style.background = value;
            }
        }, this);
        this.listenTo(this.model, 'change:description', function(sender, value) {
            this.updateDescription();
        }, this);

        // this.$slider.find('a').css('background', this.model.get('slider_color'));
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
            // this.$readout.css(name, value);
            this.readout.style[name] = value;
        } else if (name.substring(0, 4) == 'font') {
            // this.$readout.css(name, value);
            this.readout.style[name] = value;
        } else if (name.substring(0, 6) == 'border') {
            // this.$slider.find('a').css(name, value);
            var slider_items = this.slider.getElementsByClassName('a');
            if (slider_items.length) {
              slider_items[0].style[name] = value;
            }

            // this.$slider_container.css(name, value);
            this.slider_container.style[name] = value;
        } else if (name == 'background') {
            // this.$slider_container.css(name, value);
            this.slider_container.style[name] = value;
        } else {
            // this.$el.css(name, value);
            this.el.style[name] = value;
        }
    },

    updateDescription: function(options) {
        var description = this.model.get('description');
        if (description.length === 0) {
            // this.$label.hide();
            this.label.style.visibility = 'hidden';
        } else {
            // this.typeset(this.$label, description);
            this.typeset(this.label, description);
            // this.$label.show();
            this.label.style.visibility = 'visible';
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
            var labels = this.model.get("_options_labels");
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

            var value = this.model.get('value');
            var index = labels.indexOf(value);
            // this.$slider.slider('option', 'value', index);

            // this.$readout.text(value);
            this.readout.innerText = value;

            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation === 'vertical') {
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
                this.readout.style.visibility = 'visible';
            } else {
                // this.$readout.hide();
                this.readout.style.visibility = 'hidden';
            }
        }
        return SelectionSliderView.__super__.update.apply(this);
    },

    events: {
        // Dictionary of events and their handlers.
        "slide": "handleSliderChange",
        "slidestop": "handleSliderChanged",
    },

    /**
     * Called when the slider value is changing.
     */
    handleSliderChange: function(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var value = this.model.get("_options_labels")[actual_value];
        // this.$readout.text(value);
        this.readout.innerText = value;

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
        var value = this.model.get("_options_labels")[actual_value];
        // this.$readout.text(value);
        this.readout.innerText = value;
        this.model.set('value', value, {updated_view: this});
        this.touch();
    },

    _validate_slide_value: function(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         *
         * Double bit-wise not truncates the decimal (int cast).
         */
        return ~~x;
    },
});

var MultipleSelectionModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: "MultipleSelectionModel",
    }),
});

var SelectMultipleModel = MultipleSelectionModel.extend({
    defaults: _.extend({}, MultipleSelectionModel.prototype.defaults, {
        _model_name: "SelectMultipleModel",
        _view_name: "SelectMultipleView",
    }),
});

var SelectMultipleView = SelectView.extend({
    render: function() {
        /**n
         * Called when view is rendered.
         */
        SelectMultipleView.__super__.render.apply(this);
        // this.$el
        //   .removeClass('widget-select')
        //   .addClass('widget-select-multiple');
        this.el.classList.remove('widget-select');
        this.el.classList.add('widget-select-multiple');

        this.$listbox.attr('multiple', true)
          .on('change', $.proxy(this.handle_change, this));
        this.listbox.setAttribute('multiple', true);
        this.listbox.onchange = () => { this.handle_change.bind(this); };

        // set selected labels *after* setting the listbox to be multiple selection
        // this.$listbox.val(this.model.get('value'));
        this.listbox.value = this.model.get('value');
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
        // this.$listbox.val(this.model.get('value'));
        this.listbox.value = this.model.get('value');
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
        var value = Array.prototype.map.call(this.listbox.selectedOptions || [], function(option) {
            return items[option.index];
        });

        this.model.set('value',
            value,
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
    SelectMultipleModel: SelectMultipleModel,
};
