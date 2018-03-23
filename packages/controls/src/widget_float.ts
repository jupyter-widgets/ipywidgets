// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    DescriptionView
} from './widget_description';

import * as _ from 'underscore';

import {
    IntSliderView, IntRangeSliderView, IntTextView, BaseIntSliderView
} from './widget_int';

import {
    format
} from 'd3-format';


export
class FloatModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FloatModel',
            value: 0,
        });
    }
}

export
class BoundedFloatModel extends FloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'BoundedFloatModel',
            max: 100.0,
            min: 0.0
        });
    }
}

export
class FloatSliderModel extends BoundedFloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FloatSliderModel',
            _view_name: 'FloatSliderView',
            step: 1.0,
            orientation: 'horizontal',
            _range: false,
            readout: true,
            readout_format: '.2f',
            slider_color: null,
            continuous_update: true,
            disabled: false,
        });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.on('change:readout_format', this.update_readout_format, this);
        this.update_readout_format();
    }

    update_readout_format() {
        this.readout_formatter = format(this.get('readout_format'));
    }

    readout_formatter: any;
}

export
class FloatLogSliderModel extends BoundedFloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FloatLogSliderModel',
            _view_name: 'FloatLogSliderView',
            step: 0.1,
            orientation: 'horizontal',
            _range: false,
            readout: true,
            readout_format: '.3g',
            slider_color: null,
            continuous_update: true,
            disabled: false,
            base: 10.,
            value: 1.0,
            min: 0,
            max: 4
        });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.on('change:readout_format', this.update_readout_format, this);
        this.update_readout_format();
    }

    update_readout_format() {
        this.readout_formatter = format(this.get('readout_format'));
    }

    readout_formatter: any;
}

export
class FloatRangeSliderModel extends FloatSliderModel {}

export
class FloatSliderView extends IntSliderView {
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x) {
        return x;
    }

    _parse_value = parseFloat;
}


export
class FloatLogSliderView extends BaseIntSliderView {

    update(options?) {
        super.update(options);
        let min = this.model.get('min');
        let max = this.model.get('max');
        let value = this.model.get('value');
        let base = this.model.get('base');

        let log_value = Math.log( value ) / Math.log( base );

        if(log_value > max) {
            log_value = max;
        } else if(log_value < min) {
            log_value = min;
        }
        this.$slider.slider('option', 'value', log_value);
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
        let base = this.model.get('base');

        if (isNaN(value)) {
            this.readout.textContent = this.valueToString(this.model.get('value'));
        } else {
            value = Math.max(Math.min(value, Math.pow(base,vmax)), Math.pow(base,vmin));

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
        let base = this.model.get('base');
        let actual_value = Math.pow(base,this._validate_slide_value(ui.value));
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
        let base = this.model.get('base');
        let actual_value = Math.pow(base,this._validate_slide_value(ui.value));
        this.model.set('value', actual_value, {updated_view: this});
        this.touch();
    }

    _validate_slide_value(x) {
        return x;
    }

    _parse_value = parseFloat;

}


export
class FloatRangeSliderView extends IntRangeSliderView {
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x) {
        return x;
    }

    _parse_value = parseFloat;

    // matches: whitespace?, float, whitespace?, (hyphen, colon, or en-dash), whitespace?, float
    _range_regex = /^\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][-:]?\d+)?)\s*[-:–]\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][+-]?\d+)?)/;
}

export
class FloatTextModel extends FloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FloatTextModel',
            _view_name: 'FloatTextView',
            disabled: false,
            continuous_update: false,
        });
    }
}

export
class BoundedFloatTextModel extends BoundedFloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'BoundedFloatTextModel',
            _view_name: 'FloatTextView',
            disabled: false,
            continuous_update: false,
            step: 0.1
        });
    }
}

export
class FloatTextView extends IntTextView {
    _parse_value = parseFloat;
    _default_step = 'any';
}

export
class FloatProgressModel extends BoundedFloatModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'FloatProgressModel',
            _view_name: 'ProgressView',
            orientation: 'horizontal',
            bar_style: '',
            style: null
        });
    }
}
