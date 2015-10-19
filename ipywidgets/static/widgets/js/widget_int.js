// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "nbextensions/widgets/widgets/js/widget",
    "jqueryui",
    "base/js/keyboard",
    "bootstrap"
], function(widget, $, keyboard){
    
    var IntSliderView = widget.DOMWidgetView.extend({
        render : function(){
            /**
             * Called when view is rendered.
             */
            this.$el
                .addClass('widget-hbox widget-slider');
            this.$label = $('<div />')
                .appendTo(this.$el)
                .addClass('widget-label')
                .hide();
            
            this.$slider = $('<div />')
                .slider({})
                .addClass('slider');
            // Put the slider in a container 
            this.$slider_container = $('<div />')
                .addClass('widget-hslider')
                .append(this.$slider);
            this.$el.append(this.$slider_container);
            
            this.$readout = $('<div/>')
                .appendTo(this.$el)
                .addClass('widget-readout')
                .attr('contentEditable', true)
                .hide();
                
            this.listenTo(this.model, 'change:slider_handleTextChangecolor', function(sender, value) {
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

        update_attr: function(name, value) {
            /**
             * Set a css attr of the widget view.
             */
            if (name == 'color') {
                this.$readout.css(name, value);
            } else if (name.substring(0, 4) == 'font') {
                this.$readout.css(name, value);
            } else if (name.substring(0, 6) == 'border') {
                this.$slider.find('a').css(name, value);
                this.$slider_container.css(name, value);
            } else if (name == 'width' || name == 'height' || name == 'background') {
                this.$slider_container.css(name, value);
            } else if (name == 'padding' || name == 'margin') {
                this.$el.css(name, value);
            } else {
                this.$slider.css(name, value);
            }
        },
        
        updateDescription: function(options) {
            var description = this.model.get('description');
            if (description.length === 0) {
                this.$label.hide();
            } else {
                this.typeset(this.$label, description);
                this.$label.show();
            }
        },
        
        update : function(options){
            /**
             * Update the contents of this view
             *
             * Called when the model is changed.  The model may have been 
             * changed by another view or by a state update from the back-end.
             */
            if (options === undefined || options.updated_view != this) {
                // JQuery slider option keys.  These keys happen to have a
                // one-to-one mapping with the corrosponding keys of the model.
                var jquery_slider_keys = ['step', 'disabled'];
                var that = this;
                that.$slider.slider({});
                _.each(jquery_slider_keys, function(key, i) {
                    var model_value = that.model.get(key);
                    if (model_value !== undefined) {
                        that.$slider.slider("option", key, model_value);
                    }
                });

                var max = this.model.get('max');
                var min = this.model.get('min');
                if (min <= max) {
                    if (max !== undefined) this.$slider.slider('option', 'max', max);
                    if (min !== undefined) this.$slider.slider('option', 'min', min);
                }

                var range_value = this.model.get("_range");
                if (range_value !== undefined) {
                    this.$slider.slider("option", "range", range_value);
                }

                // WORKAROUND FOR JQUERY SLIDER BUG.
                // The horizontal position of the slider handle
                // depends on the value of the slider at the time
                // of orientation change.  Before applying the new
                // workaround, we set the value to the minimum to
                // make sure that the horizontal placement of the
                // handle in the vertical slider is always 
                // consistent.
                var orientation = this.model.get('orientation');
                var min = this.model.get('min');
                var max = this.model.get('max');
                if (this.model.get('_range')) {
                    this.$slider.slider('option', 'values', [min, min]);
                } else {
                    this.$slider.slider('option', 'value', min);
                }
                this.$slider.slider('option', 'orientation', orientation);
                var value = this.model.get('value');
                if (this.model.get('_range')) {
                    // values for the range case are validated python-side in
                    // _Bounded{Int,Float}RangeWidget._validate
                    this.$slider.slider('option', 'values', value);
                    this.$readout.text(this.valueToString(value));
                } else {
                    if(value > max) { 
                        value = max; 
                    }
                    else if(value < min){ 
                        value = min; 
                    }
                    this.$slider.slider('option', 'value', value);
                    this.$readout.text(this.valueToString(value));
                }

                if(this.model.get('value')!=value) {
                    this.model.set('value', value, {updated_view: this});
                    this.touch();
                }

                // Use the right CSS classes for vertical & horizontal sliders
                if (orientation=='vertical') {
                    this.$slider_container
                        .removeClass('widget-hslider')
                        .addClass('widget-vslider');
                    this.$el
                        .removeClass('widget-hbox')
                        .addClass('widget-vbox');

                } else {
                    this.$slider_container
                        .removeClass('widget-vslider')
                        .addClass('widget-hslider');
                    this.$el
                        .removeClass('widget-vbox')
                        .addClass('widget-hbox');
                }

                var readout = this.model.get('readout');
                if (readout) {
                    this.$readout.show();
                } else {
                    this.$readout.hide();
                }
            }
            return IntSliderView.__super__.update.apply(this);
        },
        
        /**
         * Write value to a string
         * @param  {number|number[]} value
         * @return {string}
         */
        valueToString: function(value) {
            if (this.model.get('_range')) {
                return value.join("-");
            } else {
                return String(value);
            }
        },
        
        /**
         * Parse value from a string
         * @param  {string} text
         * @return {number|number[]} value
         */
        stringToValue: function(text) {
            if (this.model.get("_range")) {
                // range case
                // ranges can be expressed either "val-val" or "val:val" (+spaces)
                var match = this._range_regex.exec(text);
                if (match) {
                    return [this._parse_value(match[1]), this._parse_value(match[2])];
                } else {
                    return null;
                }
                
            } else {
                return this._parse_value(text);
            }
        },
        
        events: {
            // Dictionary of events and their handlers.
            "slide": "handleSliderChange",
            "slidestop": "handleSliderChanged",
            "blur [contentEditable=true]": "handleTextChange",
            "keydown [contentEditable=true]": "handleKeyDown"
        }, 

        handleKeyDown: function(e) {
            if (e.keyCode == keyboard.keycodes.enter) {
                e.preventDefault();
                this.handleTextChange();
            }
        },

        handleTextChange: function() {
            /**
             * this handles the entry of text into the contentEditable label
             * first, the value is checked if it contains a parseable number
             *      (or pair of numbers, for the _range case)
             * then it is clamped within the min-max range of the slider
             * finally, the model is updated if the value is to be changed
             *
             * if any of these conditions are not met, the text is reset
             *
             * the step size is not enforced
             */
            var value = this.stringToValue(this.$readout.text());
            var vmin = this.model.get('min');
            var vmax = this.model.get('max');
            if (this.model.get("_range")) {
                // reject input where NaN or lower > upper
                if (value === null ||
                    isNaN(value[0]) ||
                    isNaN(value[1]) ||
                    (value[0] > value[1])) {
                    this.$readout.text(this.valueToString(this.model.get('value')));
                } else {
                    // clamp to range
                    value = [Math.max(Math.min(value[0], vmax), vmin),
                              Math.max(Math.min(value[1], vmax), vmin)];

                    if ((value[0] != this.model.get('value')[0]) ||
                        (value[1] != this.model.get('value')[1])) {
                        this.$readout.text(this.valueToString(value));
                        this.model.set('value', value, {updated_view: this});
                        this.touch();
                    } else {
                        this.$readout.text(this.valueToString(this.model.get('value')));
                    }
                }
            } else {
                
                // single value case
                if (isNaN(value)) {
                    this.$readout.text(this.valueToString(this.model.get('value')));
                } else {
                    value = Math.max(Math.min(value, vmax), vmin);

                    if (value != this.model.get('value')) {
                        this.$readout.text(this.valueToString(value));
                        this.model.set('value', value, {updated_view: this});
                        this.touch();
                    } else {
                        this.$readout.text(this.valueToString(this.model.get('value')));
                    }
                }
            }
        },

        _parse_value: parseInt,

        _range_regex: /^\s*([+-]?\d+)\s*[-:]\s*([+-]?\d+)/,

        /**
         * Called when the slider value is changing.
         */
        handleSliderChange: function(e, ui) { 
            var actual_value;
            if (this.model.get("_range")) {
                actual_value = ui.values.map(this._validate_slide_value);
                this.$readout.text(actual_value.join("-"));
            } else {
                actual_value = this._validate_slide_value(ui.value);
                this.$readout.text(actual_value);
            }
            
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
            var actual_value;
            if (this.model.get("_range")) {
                actual_value = ui.values.map(this._validate_slide_value);
            } else {
                actual_value = this._validate_slide_value(ui.value);
            }
            this.model.set('value', actual_value, {updated_view: this});
            this.touch();
        },

        _validate_slide_value: function(x) {
            /**
             * Validate the value of the slider before sending it to the back-end
             * and applying it to the other views on the page.
             *
             * Double bit-wise not truncates the decimel (int cast).
             */
            return ~~x;
        },
    });


    var IntTextView = widget.DOMWidgetView.extend({    
        render : function(){
            /**
             * Called when view is rendered.
             */
            this.$el
                .addClass('widget-hbox widget-numeric-text');
            this.$label = $('<div />')
                .appendTo(this.$el)
                .addClass('widget-label')
                .hide();
            this.$textbox = $('<input type="text" />')
                .addClass('form-control')
                .addClass('widget-numeric-text')
                .appendTo(this.$el);
                
            this.listenTo(this.model, 'change:description', function(sender, value) {
                this.updateDescription();
            }, this);
                
            this.update(); // Set defaults.
            this.updateDescription();
        },
        
        updateDescription: function() {
            var description = this.model.get('description');
            if (description.length === 0) {
                this.$label.hide();
            } else {
                this.typeset(this.$label, description);
                this.$label.show();
            }
        },
        
        update : function(options){
            /**
             * Update the contents of this view
             *
             * Called when the model is changed.  The model may have been 
             * changed by another view or by a state update from the back-end.
             */
            if (options === undefined || options.updated_view != this) {
                var value = this.model.get('value');
                if (this._parse_value(this.$textbox.val()) != value) {
                    this.$textbox.val(value);
                }
                
                if (this.model.get('disabled')) {
                    this.$textbox.attr('disabled','disabled');
                } else {
                    this.$textbox.removeAttr('disabled');
                }
            }
            return IntTextView.__super__.update.apply(this);
        },

        update_attr: function(name, value) {
            /**
             * Set a css attr of the widget view.
             */
            if (name == 'padding' || name == 'margin') {
                this.$el.css(name, value);
            } else {
                this.$textbox.css(name, value);
            }
        },

        events: {
            // Dictionary of events and their handlers.
            "keyup input"  : "handleChanging",
            "paste input"  : "handleChanging",
            "cut input"    : "handleChanging",

            // Fires only when control is validated or looses focus.
            "change input" : "handleChanged"
        }, 
        
        handleChanging: function(e) { 
            /**
             * Handles and validates user input.
             *
             * Try to parse value as a int.
             */
            var numericalValue = 0;
            var trimmed = e.target.value.trim();
            if (trimmed === '') {
                return;
            } else {
                if (!(['-', '-.', '.', '+.', '+'].indexOf(trimmed) >= 0)) {
                    numericalValue = this._parse_value(e.target.value);    
                }                
            }
            
            // If parse failed, reset value to value stored in model.
            if (isNaN(numericalValue)) {
                e.target.value = this.model.get('value');
            } else if (!isNaN(numericalValue)) {
                if (this.model.get('max') !== undefined) {
                    numericalValue = Math.min(this.model.get('max'), numericalValue);
                }
                if (this.model.get('min') !== undefined) {
                    numericalValue = Math.max(this.model.get('min'), numericalValue);
                }
                
                // Apply the value if it has changed.
                if (numericalValue != this.model.get('value')) {
            
                    // Calling model.set will trigger all of the other views of the 
                    // model to update.
                    this.model.set('value', numericalValue, {updated_view: this});
                    this.touch();
                }
            }
        },
        
        handleChanged: function(e) {
            /**
             * Applies validated input.
             */
            if (e.target.value.trim() === '' || e.target.value !== this.model.get('value')) {
                e.target.value = this.model.get('value');
            }
        },

        _parse_value: parseInt
    });


    var ProgressView = widget.DOMWidgetView.extend({
        render : function(){
            /**
             * Called when view is rendered.
             */
            this.$label = $('<div />')
                .appendTo(this.$el)
                .addClass('widget-label')
                .hide();
            this.$progress = $('<div />')
                .addClass('progress')
                .css('position', 'relative')
                .appendTo(this.$el);
            this.$bar = $('<div />')
                .addClass('progress-bar')
                .css({
                    'position': 'absolute',
                    'bottom': 0, 'left': 0,
                })
                .appendTo(this.$progress);
            
            // Set defaults.
            this.update(); 
            this.updateDescription();
            
            this.listenTo(this.model, 'change:bar_style', function(model, value) {
                this.update_bar_style();
            }, this);
            this.listenTo(this.model, 'change:description', function(sender, value) {
                this.updateDescription();
            }, this);
            
            this.update_bar_style('');
        },
        
        updateDescription: function() {
            var description = this.model.get('description');
            if (description.length === 0) {
                this.$label.hide();
            } else {
                this.typeset(this.$label, description);
                this.$label.show();
            }    
        },
        
        update : function(){
            /**
             * Update the contents of this view
             *
             * Called when the model is changed.  The model may have been 
             * changed by another view or by a state update from the back-end.
             */
            var value = this.model.get('value');
            var max = this.model.get('max');
            var min = this.model.get('min');
            var orientation = this.model.get('orientation');
            var percent = 100.0 * (value - min) / (max - min);
            if (orientation === 'horizontal') {
                this.$el
                   .removeClass('widget-vbox')
                   .addClass('widget-hbox');
                this.$progress.removeClass('widget-vprogress');
                this.$progress.addClass('widget-hprogress');
                this.$bar.css({
                    'width': percent + '%',
                    'height': '100%',
                });
            } else {
                this.$el
                   .removeClass('widget-hbox')
                   .addClass('widget-vbox');
                this.$progress.removeClass('widget-hprogress');
                this.$progress.addClass('widget-vprogress');
                this.$bar.css({
                    'width': '100%',
                    'height': percent + '%',
                });
            }
            return ProgressView.__super__.update.apply(this);
        }, 

        update_bar_style: function(previous_trait_value) {
            var class_map = {
                success: ['progress-bar-success'],
                info: ['progress-bar-info'],
                warning: ['progress-bar-warning'],
                danger: ['progress-bar-danger']
            };
            this.update_mapped_classes(class_map, 'bar_style', previous_trait_value, this.$bar[0]);
        },

        update_attr: function(name, value) {
            /**
             * Set a css attr of the widget view.
             */
            if (name.substring(0, 6) == 'border' || name == 'width' || 
                name == 'height' || name == 'background' || name == 'margin' || 
                name == 'padding') {
                
                this.$progress.css(name, value);
            } else if (name == 'color') {                
                this.$bar.css('background', value);
            } else if (name == 'padding' || name == 'margin') {
                this.$el.css(name, value);
            } else {
                this.$bar.css(name, value);
            }
        },
    });

    return {
        'IntSliderView': IntSliderView, 
        'IntTextView': IntTextView,
        'ProgressView': ProgressView,
    };
});
