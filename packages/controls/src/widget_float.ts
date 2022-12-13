// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDescriptionModel } from './widget_core';

import {
  BaseIntSliderView,
  IntRangeSliderView,
  IntSliderView,
  IntTextView,
} from './widget_int';

import { format } from 'd3-format';

import noUiSlider from 'nouislider';

export class FloatModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'FloatModel',
      value: 0,
    };
  }
}

export class BoundedFloatModel extends FloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'BoundedFloatModel',
      max: 100.0,
      min: 0.0,
    };
  }
}

export class FloatSliderModel extends BoundedFloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
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
    };
  }
  initialize(
    attributes: any,
    options: { model_id: string; comm?: any; widget_manager: any }
  ): void {
    super.initialize(attributes, options);
    this.on('change:readout_format', this.update_readout_format, this);
    this.update_readout_format();
  }

  update_readout_format(): void {
    this.readout_formatter = format(this.get('readout_format'));
  }

  readout_formatter: any;
}

export class FloatLogSliderModel extends BoundedFloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
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
      base: 10,
      value: 1.0,
      min: 0,
      max: 4,
    };
  }
  initialize(
    attributes: any,
    options: { model_id: string; comm: any; widget_manager: any }
  ): void {
    super.initialize(attributes, options);
    this.on('change:readout_format', this.update_readout_format, this);
    this.update_readout_format();
  }

  update_readout_format(): void {
    this.readout_formatter = format(this.get('readout_format'));
  }

  readout_formatter: any;
}

export class FloatRangeSliderModel extends FloatSliderModel {}

export class FloatSliderView extends IntSliderView {
  /**
   * Validate the value of the slider before sending it to the back-end
   * and applying it to the other views on the page.
   */
  _validate_slide_value(x: any): any {
    return x;
  }

  _parse_value = parseFloat;
}

export class FloatLogSliderView extends BaseIntSliderView {
  update(options?: any): void {
    super.update(options);
    const value = this.model.get('value');
    this.readout.textContent = this.valueToString(value);
  }

  /**
   * Convert from value to exponent
   *
   * @param value the widget value
   * @returns the log-value between the min/max exponents
   */
  logCalc(value: number): number {
    const min = this.model.get('min');
    const max = this.model.get('max');
    const base = this.model.get('base');
    let log_value = Math.log(value) / Math.log(base);

    if (log_value > max) {
      log_value = max;
    } else if (log_value < min) {
      log_value = min;
    }

    return log_value;
  }

  createSlider(): void {
    const orientation = this.model.get('orientation');
    const behavior = this.model.get('behavior');

    noUiSlider.create(this.$slider, {
      start: this.logCalc(this.model.get('value')),
      behaviour: behavior,
      range: {
        min: this.model.get('min'),
        max: this.model.get('max'),
      },
      step: this.model.get('step') ?? undefined,
      animate: false,
      orientation: orientation,
      direction: orientation === 'horizontal' ? 'ltr' : 'rtl',
      format: {
        from: (value: string): number => Number(value),
        to: (value: number): number => value,
      },
    });

    // Using noUiSlider's 'update' and 'change' events.
    // See reference: https://refreshless.com/nouislider/events-callbacks/
    this.$slider.noUiSlider.on('update', (values: any, handle: any) => {
      this.handleSliderUpdateEvent(values, handle);
    });

    this.$slider.noUiSlider.on('change', (values: any, handle: any) => {
      this.handleSliderChangeEvent(values, handle);
    });
  }

  /**
   * Write value to a string
   */
  valueToString(value: number): string {
    const format = this.model.readout_formatter;
    return format(value);
  }

  /**
   * Parse value from a string
   */
  stringToValue(text: string | null): number {
    return text === null ? NaN : this._parse_value(text);
  }

  /**
   * this handles the entry of text into the contentEditable label first, the
   * value is checked if it contains a parseable value then it is clamped
   * within the min-max range of the slider finally, the model is updated if
   * the value is to be changed
   *
   * if any of these conditions are not met, the text is reset
   */
  handleTextChange(): void {
    let value = this.stringToValue(this.readout.textContent);
    const vmin = this.model.get('min');
    const vmax = this.model.get('max');
    const base = this.model.get('base');

    if (isNaN(value)) {
      this.readout.textContent = this.valueToString(this.model.get('value'));
    } else {
      value = Math.max(
        Math.min(value, Math.pow(base, vmax)),
        Math.pow(base, vmin)
      );

      if (value !== this.model.get('value')) {
        this.readout.textContent = this.valueToString(value);
        this.model.set('value', value);
        this.touch();
      } else {
        this.readout.textContent = this.valueToString(this.model.get('value'));
      }
    }
  }

  /**
   * Called whilst the slider is dragged, tapped or moved by the arrow keys.
   */
  handleSliderUpdateEvent(values: number[], handle: number): void {
    const base = this.model.get('base');
    const actual_value = Math.pow(base, this._validate_slide_value(values[0]));
    this.readout.textContent = this.valueToString(actual_value);

    // Only persist the value while sliding if the continuous_update
    // trait is set to true.
    if (this.model.get('continuous_update')) {
      this.handleSliderChanged(values, handle);
    }
  }

  /**
   * Called when the slider handle is released after dragging,
   * or by tapping or moving by the arrow keys.
   */
  handleSliderChangeEvent(values: number[], handle: number): void {
    const base = this.model.get('base');
    const actual_value = Math.pow(base, this._validate_slide_value(values[0]));
    this.readout.textContent = this.valueToString(actual_value);

    this.handleSliderChanged(values, handle);
  }

  /**
   * Called when the slider value has changed.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  handleSliderChanged(values: number[], handle: number): void {
    if (this._updating_slider) {
      return;
    }
    const base = this.model.get('base');
    const actual_value = Math.pow(base, this._validate_slide_value(values[0]));
    this.model.set('value', actual_value, { updated_view: this });
    this.touch();
  }

  updateSliderValue(model: any, value: any, options: any): void {
    if (options.updated_view === this) {
      return;
    }
    const log_value = this.logCalc(this.model.get('value'));
    this.$slider.noUiSlider.set(log_value);
  }

  updateSliderOptions(e: any): void {
    this.$slider.noUiSlider.updateOptions({
      start: this.logCalc(this.model.get('value')),
      range: {
        min: this.model.get('min'),
        max: this.model.get('max'),
      },
      step: this.model.get('step'),
    });
  }

  _validate_slide_value(x: any): any {
    return x;
  }

  _parse_value = parseFloat;
  private _updating_slider: boolean;
}

export class FloatRangeSliderView extends IntRangeSliderView {
  /**
   * Validate the value of the slider before sending it to the back-end
   * and applying it to the other views on the page.
   */
  _validate_slide_value(x: any): any {
    return x;
  }

  _parse_value = parseFloat;

  // matches: whitespace?, float, whitespace?, (hyphen, colon, or en-dash), whitespace?, float
  _range_regex =
    /^\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][-:]?\d+)?)\s*[-:–]\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][+-]?\d+)?)/;
}

export class FloatTextModel extends FloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'FloatTextModel',
      _view_name: 'FloatTextView',
      disabled: false,
      continuous_update: false,
    };
  }
}

export class BoundedFloatTextModel extends BoundedFloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'BoundedFloatTextModel',
      _view_name: 'FloatTextView',
      disabled: false,
      continuous_update: false,
      step: 0.1,
    };
  }
}

export class FloatTextView extends IntTextView {
  _parse_value = parseFloat;
  _default_step = 'any';

  /**
   * Handle key press
   */
  handleKeypress(e: KeyboardEvent): void {
    // Overwrite IntTextView's handleKeypress
    // which prevents decimal points.
    e.stopPropagation();
  }

  /**
   * Handle key up
   */
  handleKeyUp(e: KeyboardEvent): void {
    // Overwrite IntTextView's handleKeyUp
    // which prevents decimal points.
  }
}

export class FloatProgressModel extends BoundedFloatModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'FloatProgressModel',
      _view_name: 'ProgressView',
      orientation: 'horizontal',
      bar_style: '',
      style: null,
    };
  }
}
