// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreLabeledDOMWidgetModel
} from './widget_core';

import {
    DOMWidgetView, LabeledDOMWidgetView
} from './widget';

import {
    StyleModel
} from './widget_style';

import * as _ from 'underscore';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

var d3format: any = (require('d3-format') as any).format;

export
class IntModel extends CoreLabeledDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'IntModel',
            value: 0,
            disabled: false,
        });
    }
}

export
class BoundedIntModel extends IntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'BoundedIntModel',
            max: 100,
            min: 0
        });
    }
}

export
class SliderStyleModel extends StyleModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SliderStyleModel',
        });
    }

    public static styleProperties = {
        handle_color: {
            selector: '.ui-slider-handle',
            attribute: 'background-color',
            default: null
        }
    };
}

export
class IntSliderModel extends BoundedIntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'IntSliderModel',
            _view_name: 'IntSliderView',
            step: 1,
            orientation: 'horizontal',
            readout: true,
            readout_format: 'd',
            continuous_update: true,
            style: void 0
        });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.on('change:readout_format', this.update_readout_format, this);
        this.update_readout_format();
    }
    update_readout_format() {
        this.readout_formatter = d3format(this.get('readout_format'));
    }
    readout_formatter: any;
}

export
class IntRangeSliderModel extends IntSliderModel {}

export
abstract class BaseIntSliderView extends LabeledDOMWidgetView {
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-slider');
        this.el.classList.add('widget-hslider');

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
        this.readout.contentEditable = 'true';
        this.readout.style.display = 'none';

        // Set defaults.
        this.update();
    }

    update(options?) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view !== this) {
            // JQuery slider option keys.  These keys happen to have a
            // one-to-one mapping with the corresponding keys of the model.
            let jquery_slider_keys = ['step', 'disabled'];
            let that = this;
            that.$slider.slider({});

            _.each(jquery_slider_keys, function(key, i) {
                let model_value = that.model.get(key);
                if (model_value !== undefined) {
                    that.$slider.slider('option', key, model_value);
                }
            });

            let max = this.model.get('max');
            let min = this.model.get('min');
            if (min <= max) {
                if (max !== undefined) this.$slider.slider('option', 'max', max);
                if (min !== undefined) this.$slider.slider('option', 'min', min);
            }

            // WORKAROUND FOR JQUERY SLIDER BUG.
            // The horizontal position of the slider handle
            // depends on the value of the slider at the time
            // of orientation change.  Before applying the new
            // workaround, we set the value to the minimum to
            // make sure that the horizontal placement of the
            // handle in the vertical slider is always
            // consistent.
            let orientation = this.model.get('orientation');
            this.$slider.slider('option', 'orientation', orientation);

            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation==='vertical') {
                this.el.classList.remove('widget-hslider');
                this.el.classList.add('widget-vslider');
                this.el.classList.remove('widget-inline-hbox');
                this.el.classList.add('widget-inline-vbox');
            } else {
                this.el.classList.remove('widget-vslider');
                this.el.classList.add('widget-hslider');
                this.el.classList.remove('widget-inline-vbox');
                this.el.classList.add('widget-inline-hbox');
            }

            let readout = this.model.get('readout');
            if (readout) {
                this.readout.style.display = '';
                this.displayed.then(function() {
                    if (that.readout_overflow()) {
                        that.readout.classList.add('overflow');
                    } else {
                        that.readout.classList.remove('overflow');
                    }
                });
            } else {
                this.readout.style.display = 'none';
            }

        }
        return super.update();
    }

    /**
     * Returns true if the readout box content overflows.
     */
    readout_overflow() {
        return this.readout.scrollWidth > this.readout.clientWidth;
    }

    /**
     * Write value to a string
     */
    abstract valueToString(value): string;

    /**
     * Parse value from a string
     */
    abstract stringToValue(text: string);

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'slide': 'handleSliderChange',
            'slidestop': 'handleSliderChanged',
            'blur [contentEditable=true]': 'handleTextChange',
            'keydown [contentEditable=true]': 'handleKeyDown'
        }
    }

    handleKeyDown(e) {
        if (e.keyCode === 13) { /* keyboard keycodes `enter` */
            e.preventDefault();
            this.handleTextChange();
        }
    }

    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    abstract handleTextChange();

    /**
     * Called when the slider value is changing.
     */
    abstract handleSliderChange(e, ui);

    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    abstract handleSliderChanged(e, ui);

    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x) {
        return Math.floor(x);
    }

    $slider: any;
    slider_container: HTMLElement;
    readout: HTMLDivElement;
    model: IntSliderModel;
    _parse_value = parseInt;
}

export
class IntRangeSliderView extends BaseIntSliderView {

    update(options?) {
        super.update(options);
        this.$slider.slider('option', 'range', true);
        // values for the range case are validated python-side in
        // _Bounded{Int,Float}RangeWidget._validate
        let value = this.model.get('value');
        this.$slider.slider('option', 'values', value.slice());
        this.readout.textContent = this.valueToString(value);
        if (this.model.get('value') !== value) {
            this.model.set('value', value, {updated_view: this});
            this.touch();
        }
    }

    /**
     * Write value to a string
     */
    valueToString(value: number[]): string {
        let format = this.model.readout_formatter;
        return value.map(function (v) {
                return format(v);
            }).join(' – ');
    }

    /**
     * Parse value from a string
     */
    stringToValue(text: string): number[] {
        // ranges can be expressed either 'val-val' or 'val:val' (+spaces)
        let match = this._range_regex.exec(text);
        if (match) {
            return [this._parse_value(match[1]), this._parse_value(match[2])];
        } else {
            return null;
        }
    }

    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    handleTextChange() {
        let value = this.stringToValue(this.readout.textContent);
        let vmin = this.model.get('min');
        let vmax = this.model.get('max');
        // reject input where NaN or lower > upper
        if (value === null ||
            isNaN(value[0]) ||
            isNaN(value[1]) ||
            (value[0] > value[1])) {
            this.readout.textContent = this.valueToString(this.model.get('value'));
        } else {
            // clamp to range
            value = [Math.max(Math.min(value[0], vmax), vmin),
                        Math.max(Math.min(value[1], vmax), vmin)];

            if ((value[0] !== this.model.get('value')[0]) ||
                (value[1] !== this.model.get('value')[1])) {
                this.readout.textContent = this.valueToString(value);
                this.model.set('value', value, {updated_view: this});
                this.touch();
            } else {
                this.readout.textContent = this.valueToString(this.model.get('value'));
            }
        }
    }
    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e, ui) {
        let actual_value = ui.values.map(this._validate_slide_value);
        this.readout.textContent = this.valueToString(actual_value);

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
        let actual_value = ui.values.map(this._validate_slide_value);
        this.model.set('value', actual_value, {updated_view: this});
        this.touch();
    }

    // range numbers can be separated by a hyphen, colon, or an en-dash
    _range_regex = /^\s*([+-]?\d+)\s*[-:–]\s*([+-]?\d+)/;

}

export
class IntSliderView extends BaseIntSliderView {

    update(options?) {
        super.update(options);
        let min = this.model.get('min');
        let max = this.model.get('max');
        let value = this.model.get('value');

        if(value > max) {
            value = max;
        } else if(value < min) {
            value = min;
        }
        this.$slider.slider('option', 'value', value);
        this.readout.textContent = this.valueToString(value);
        if(this.model.get('value') !== value) {
            this.model.set('value', value, {updated_view: this});
            this.touch();
        }
    }

    /**
     * Write value to a string
     */
    valueToString(value: number): string {
        let format = this.model.readout_formatter;
        return format(value);
    }

    /**
     * Parse value from a string
     */
    stringToValue(text: string): number {
            return this._parse_value(text);
    }

    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    handleTextChange() {
        let value = this.stringToValue(this.readout.textContent);
        let vmin = this.model.get('min');
        let vmax = this.model.get('max');

        if (isNaN(value as number)) {
            this.readout.textContent = this.valueToString(this.model.get('value'));
        } else {
            value = Math.max(Math.min(value as number, vmax), vmin);

            if (value !== this.model.get('value')) {
                this.readout.textContent = this.valueToString(value);
                this.model.set('value', value, {updated_view: this});
                this.touch();
            } else {
                this.readout.textContent = this.valueToString(this.model.get('value'));
            }
        }
    }
    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e, ui) {
        let actual_value = this._validate_slide_value(ui.value);
        this.readout.textContent = this.valueToString(actual_value);

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
        let actual_value = this._validate_slide_value(ui.value);
        this.model.set('value', actual_value, {updated_view: this});
        this.touch();
    }
}


export
class IntTextModel extends IntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'IntTextModel',
            _view_name: 'IntTextView'
        });
    }
}

export
class BoundedIntTextModel extends BoundedIntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'BoundedIntTextModel',
            _view_name: 'IntTextView'
        });
    }
}

export
class IntTextView extends LabeledDOMWidgetView {
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-text');

        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', 'text');
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
        if (options === undefined || options.updated_view !== this) {
            var value: number = this.model.get('value');

            if (this._parse_value(this.textbox.value) !== value) {
                this.textbox.value = value.toString();
            }

            var disabled = this.model.get('disabled');
            if (disabled) {
                this.textbox.setAttribute('disabled', disabled);
            } else {
                this.textbox.removeAttribute('disabled');
            }
        }
        return super.update();
    }

    events(): {[e: string]: string} {
        return {
            // Dictionary of events and their handlers.
            'keydown input'  : 'handleKeyDown',
            'keypress input' : 'handleKeypress',
            'keyup input'  : 'handleChanging',
            'paste input'  : 'handleChanging',
            'cut input'    : 'handleChanging',

            // Fires only when control is validated or looses focus.
            'change input' : 'handleChanged'
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
     * Stop propagation so the event isn't sent to the application.
     */
    handleKeypress(e) {
        e.stopPropagation();
    }

    /**
     * Handles and validates user input.
     *
     * Try to parse value as an int.
     */
    handleChanging(e) {
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
            // Handle both the IntTextModel and the BoundedIntTextModel by
            // checking to see if the max/min properties are defined
            if (this.model.get('max') !== undefined) {
                numericalValue = Math.min(this.model.get('max'), numericalValue);
            }
            if (this.model.get('min') !== undefined) {
                numericalValue = Math.max(this.model.get('min'), numericalValue);
            }

            // Apply the value if it has changed.
            if (numericalValue !== this.model.get('value')) {

                // Calling model.set will trigger all of the other views of the
                // model to update.
                this.model.set('value', numericalValue, {updated_view: this});
                this.touch();
            }
        }
    }

    /**
     * Applies validated input.
     */
    handleChanged(e) {
        if (e.target.value.trim() === '' || e.target.value !== this.model.get('value')) {
            e.target.value = this.model.get('value');
        }
    }

    _parse_value = parseInt
    textbox: HTMLInputElement;
}


export
class ProgressStyleModel extends StyleModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ProgressStyleModel',
        });
    }

    public static styleProperties = {
        bar_color: {
            selector: '.progress-bar',
            attribute: 'background-color',
            default: null
        }
    };
}


export
class IntProgressModel extends BoundedIntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'IntProgressModel',
            _view_name: 'ProgressView',
            orientation: 'horizontal',
            bar_style: '',
            style: void 0
        });
    }
}


export
class ProgressView extends LabeledDOMWidgetView {
    initialize(parameters) {
        super.initialize(parameters);
        this.listenTo(this.model, 'change:bar_style', this.update_bar_style);
        this.pWidget.addClass('jupyter-widgets');
    }

    render() {
        super.render();
        var orientation = this.model.get('orientation');
        var className = orientation === 'horizontal' ?
            'widget-hprogress' : 'widget-vprogress';
        this.el.classList.add(className);

        this.progress = document.createElement('div');
        this.progress.classList.add('progress');
        this.progress.style.position = 'relative';
        this.el.appendChild(this.progress);

        this.bar = document.createElement('div');
        this.bar.classList.add('progress-bar');
        this.bar.style.position = 'absolute';
        this.bar.style.bottom = '0px';
        this.bar.style.left = '0px';
        this.progress.appendChild(this.bar);

        // Set defaults.
        this.update();
        this.set_bar_style();
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        var value = this.model.get('value');
        var max = this.model.get('max');
        var min = this.model.get('min');
        var orientation = this.model.get('orientation');
        var percent = 100.0 * (value - min) / (max - min);
        if (orientation === 'horizontal') {
            this.el.classList.remove('widget-inline-vbox');
            this.el.classList.remove('widget-vprogress');

            this.el.classList.add('widget-inline-hbox');
            this.el.classList.add('widget-hprogress');

            this.bar.style.width = percent + '%';
            this.bar.style.height = '100%';
        } else {
            this.el.classList.remove('widget-inline-hbox');
            this.el.classList.remove('widget-hprogress');

            this.el.classList.add('widget-inline-vbox');
            this.el.classList.add('widget-vprogress');

            this.bar.style.width = '100%';
            this.bar.style.height = percent + '%';
        }
        return super.update();
    }

    update_bar_style() {
        this.update_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
    }

    set_bar_style() {
        this.set_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
    }

    progress: HTMLDivElement;
    bar: HTMLDivElement;

    static class_map = {
        success: ['progress-bar-success'],
        info: ['progress-bar-info'],
        warning: ['progress-bar-warning'],
        danger: ['progress-bar-danger']
    };
}

export
class PlayModel extends BoundedIntModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'PlayModel',
            _view_name: 'PlayView',
            _playing: false,
            interval: 100,
            step: 1,
        });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.on('change:_playing', function () {
            if (this.get('_playing')) {
                this.loop();
            }
        }, this);
    }

    loop() {
        if (this.get('_playing')) {
            var next_value = this.get('value') + this.get('step');
            if (next_value < this.get('max')) {
                this.set('value', next_value);
                window.setTimeout(this.loop.bind(this), this.get('interval'));
            } else {
                this.set('value', this.get('min'));
                this.set('_playing', false);
            }
            this.save_changes();
        }
    }

    stop() {
        this.set('_playing', false);
        this.set('value', this.get('min'));
        this.save_changes();
    }

    pause() {
        this.set('_playing', false);
        this.save_changes();
    }

    play() {
        this.set('_playing', true);
        this.save_changes();
    }
}

export
class PlayView extends DOMWidgetView {
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-play');

        this.playButton = document.createElement('button');
        this.pauseButton = document.createElement('button');
        this.stopButton = document.createElement('button');

        this.playButton.className = 'jupyter-button';
        this.pauseButton.className = 'jupyter-button';
        this.stopButton.className = 'jupyter-button';

        this.el.appendChild(this.playButton);  // Toggle button with playing
        this.el.appendChild(this.pauseButton); // Disable if not playing
        this.el.appendChild(this.stopButton);  // Disable if not playing

        var playIcon = document.createElement('i');
        playIcon.className = 'fa fa-play';
        this.playButton.appendChild(playIcon);
        var pauseIcon = document.createElement('i');
        pauseIcon.className = 'fa fa-pause';
        this.pauseButton.appendChild(pauseIcon);
        var stopIcon = document.createElement('i');
        stopIcon.className = 'fa fa-stop';
        this.stopButton.appendChild(stopIcon);

        this.playButton.onclick = this.model.play.bind(this.model);
        this.pauseButton.onclick = this.model.pause.bind(this.model);
        this.stopButton.onclick = this.model.stop.bind(this.model);

        this.listenTo(this.model, 'change:_playing', this.update_playing);
        this.update_playing();
    }

    update_playing() {
        var playing = this.model.get('_playing');
        if (playing) {
            this.pauseButton.disabled = false;
            this.playButton.classList.add('mod-active');
        } else {
            this.pauseButton.disabled = true;
            this.playButton.classList.remove('mod-active');
        }
    }

    playButton: HTMLButtonElement;
    pauseButton: HTMLButtonElement;
    stopButton: HTMLButtonElement;
    model: PlayModel;
}
