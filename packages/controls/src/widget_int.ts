// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDescriptionModel } from './widget_core';

import { DescriptionStyleModel, DescriptionView } from './widget_description';

import { DOMWidgetView, WidgetView } from '@jupyter-widgets/base';

import { uuid } from './utils';

import { format } from 'd3-format';

import noUiSlider from 'nouislider';

export class IntModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'IntModel',
      value: 0,
    };
  }
}

export class BoundedIntModel extends IntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'BoundedIntModel',
      max: 100,
      min: 0,
    };
  }
}

export class SliderStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return { ...super.defaults(), _model_name: 'SliderStyleModel' };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    handle_color: {
      selector: '.noUi-handle',
      attribute: 'background-color',
      default: null as any,
    },
  };
}

export class IntSliderModel extends BoundedIntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'IntSliderModel',
      _view_name: 'IntSliderView',
      step: 1,
      orientation: 'horizontal',
      readout: true,
      readout_format: 'd',
      continuous_update: true,
      style: null,
      disabled: false,
    };
  }
  initialize(
    attributes: Backbone.ObjectHash,
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

export class IntRangeSliderModel extends IntSliderModel {}

export abstract class BaseIntSliderView extends DescriptionView {
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-slider');
    this.el.classList.add('widget-hslider');

    // Creating noUiSlider instance and scaffolding
    this.$slider = document.createElement('div');
    this.$slider.classList.add('slider');

    // Put the slider in a container
    this.slider_container = document.createElement('div');
    this.slider_container.classList.add('slider-container');
    this.slider_container.appendChild(this.$slider);
    this.el.appendChild(this.slider_container);
    this.readout = document.createElement('div');
    this.el.appendChild(this.readout);
    this.readout.classList.add('widget-readout');
    this.readout.contentEditable = 'true';
    this.readout.style.display = 'none';

    // noUiSlider constructor and event handlers
    this.createSlider();

    // Event handlers
    this.model.on('change:orientation', this.regenSlider, this);
    this.model.on('change:max', this.updateSliderOptions, this);
    this.model.on('change:min', this.updateSliderOptions, this);
    this.model.on('change:step', this.updateSliderOptions, this);
    this.model.on('change:value', this.updateSliderValue, this);

    // Set defaults.
    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (options === undefined || options.updated_view !== this) {
      if (this.model.get('disabled')) {
        this.readout.contentEditable = 'false';
        this.$slider.setAttribute('disabled', true);
      } else {
        this.readout.contentEditable = 'true';
        this.$slider.removeAttribute('disabled');
      }

      // Use the right CSS classes for vertical & horizontal sliders
      const orientation = this.model.get('orientation');

      if (orientation === 'vertical') {
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

      const readout = this.model.get('readout');
      if (readout) {
        this.readout.style.display = '';
        this.displayed.then(() => {
          if (this.readout_overflow()) {
            this.readout.classList.add('overflow');
          } else {
            this.readout.classList.remove('overflow');
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
  readout_overflow(): boolean {
    return this.readout.scrollWidth > this.readout.clientWidth;
  }

  /**
   * Write value to a string
   */
  abstract valueToString(value: number | number[]): string;

  /**
   * Parse value from a string
   */
  abstract stringToValue(text: string): number | number[] | null;

  events(): { [e: string]: string } {
    return {
      // Dictionary of events and their handlers.
      'blur [contentEditable=true]': 'handleTextChange',
      'keydown [contentEditable=true]': 'handleKeyDown',
    };
  }

  handleKeyDown(e: KeyboardEvent): void {
    if (e.keyCode === 13) {
      /* keyboard keycodes `enter` */
      e.preventDefault();
      this.handleTextChange();
    }
  }

  /**
   * Create a new noUiSlider object
   */
  createSlider(): void {
    const orientation = this.model.get('orientation');
    const behavior = this.model.get('behavior');

    noUiSlider.create(this.$slider, {
      start: this.model.get('value'),
      connect: true,
      behaviour: behavior,
      range: {
        min: this.model.get('min'),
        max: this.model.get('max'),
      },
      step: this.model.get('step'),
      animate: false,
      orientation: orientation,
      direction: orientation === 'horizontal' ? 'ltr' : 'rtl',
      format: {
        from: (value: string): number => Number(value),
        to: (value: number): number => this._validate_slide_value(value),
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
   * Recreate/Regenerate a slider object
   * noUiSlider does not support in-place mutation of the orientation
   * state. We therefore need to destroy the current instance
   * and create a new one with the new properties. This is
   * handled in a separate function and has a dedicated event
   * handler.
   */
  regenSlider(e: any): void {
    this.$slider.noUiSlider.destroy();
    this.createSlider();
  }

  /**
   * Update noUiSlider object in-place with new options
   */
  abstract updateSliderOptions(e: any): void;

  /**
   * Update noUiSlider's state so that it is
   * synced with the Backbone.jas model
   */
  abstract updateSliderValue(model: any, value: any, options: any): void;

  /**
   * this handles the entry of text into the contentEditable label first, the
   * value is checked if it contains a parseable value then it is clamped
   * within the min-max range of the slider finally, the model is updated if
   * the value is to be changed
   *
   * if any of these conditions are not met, the text is reset
   */
  abstract handleTextChange(): void;

  /**
   * Called when the slider handle is released after dragging,
   * or by tapping or moving by the arrow keys.
   */
  abstract handleSliderChangeEvent(value: any, handle: any): void;

  /**
   * Called whilst the slider is dragged, tapped or moved by the arrow keys.
   */
  abstract handleSliderUpdateEvent(value: any, handle: any): void;

  /**
   * Called when the slider value has changed.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  abstract handleSliderChanged(values: number[], handle: number): void;

  /**
   * Validate the value of the slider before sending it to the back-end
   * and applying it to the other views on the page.
   */
  _validate_slide_value(x: number): number {
    return Math.round(x);
  }

  $slider: any;
  slider_container: HTMLElement;
  readout: HTMLDivElement;
  model: IntSliderModel;
  _parse_value = parseInt;
}

export class IntRangeSliderView extends BaseIntSliderView {
  update(options?: any): void {
    super.update(options);
    const value = this.model.get('value');
    this.readout.textContent = this.valueToString(value);
    if (this.model.get('value') !== value) {
      this.model.set('value', value, { updated_view: this });
      this.touch();
    }
  }

  /**
   * Write value to a string
   */
  valueToString(value: number[]): string {
    const format = this.model.readout_formatter;
    return value
      .map(function (v) {
        return format(v);
      })
      .join(' – ');
  }

  /**
   * Parse value from a string
   */
  stringToValue(text: string | null): number[] | null {
    if (text === null) {
      return null;
    }
    // ranges can be expressed either 'val-val' or 'val:val' (+spaces)
    const match = this._range_regex.exec(text);
    if (match) {
      return [this._parse_value(match[1]), this._parse_value(match[2])];
    } else {
      return null;
    }
  }

  handleTextChange(): void {
    let value = this.stringToValue(this.readout.textContent);
    const vmin = this.model.get('min');
    const vmax = this.model.get('max');
    // reject input where NaN or lower > upper
    if (
      value === null ||
      isNaN(value[0]) ||
      isNaN(value[1]) ||
      value[0] > value[1]
    ) {
      this.readout.textContent = this.valueToString(this.model.get('value'));
    } else {
      // clamp to range
      value = [
        Math.max(Math.min(value[0], vmax), vmin),
        Math.max(Math.min(value[1], vmax), vmin),
      ];

      if (
        value[0] !== this.model.get('value')[0] ||
        value[1] !== this.model.get('value')[1]
      ) {
        this.readout.textContent = this.valueToString(value);
        this.model.set('value', value);
        this.touch();
      } else {
        this.readout.textContent = this.valueToString(this.model.get('value'));
      }
    }
  }

  /**
   * Called when the slider handle is released after dragging,
   * or by tapping or moving by the arrow keys.
   */
  handleSliderChangeEvent(values: any, handle: any): void {
    const actual_value = values.map(this._validate_slide_value);
    this.readout.textContent = this.valueToString(actual_value);

    this.handleSliderChanged(values, handle);
  }

  /**
   * Called whilst the slider is dragged, tapped or moved by the arrow keys.
   */
  handleSliderUpdateEvent(values: any, handle: any): void {
    const actual_value = values.map(this._validate_slide_value);
    this.readout.textContent = this.valueToString(actual_value);

    // Only persist the value while sliding if the continuous_update
    // trait is set to true.
    if (this.model.get('continuous_update')) {
      this.handleSliderChanged(values, handle);
    }
  }

  handleSliderChanged(values: number[], handle: number): void {
    const actual_value = values.map(this._validate_slide_value);
    this.model.set('value', actual_value, { updated_view: this });
    this.touch();
  }

  updateSliderOptions(e: any): void {
    this.$slider.noUiSlider.updateOptions({
      start: this.model.get('value'),
      range: {
        min: this.model.get('min'),
        max: this.model.get('max'),
      },
      step: this.model.get('step'),
    });
  }

  updateSliderValue(model: any, _: any, options: any): void {
    if (options.updated_view === this) {
      return;
    }

    const prev_value = this.$slider.noUiSlider.get();
    const value = this.model.get('value');

    if (prev_value[0] !== value[0] || prev_value[1] !== value[1]) {
      this.$slider.noUiSlider.set(value);
    }
  }

  // range numbers can be separated by a hyphen, colon, or an en-dash
  _range_regex = /^\s*([+-]?\d+)\s*[-:–]\s*([+-]?\d+)/;
}

export class IntSliderView extends BaseIntSliderView {
  update(options?: any): void {
    super.update(options);
    const min = this.model.get('min');
    const max = this.model.get('max');
    let value = this.model.get('value');

    if (value > max) {
      value = max;
    } else if (value < min) {
      value = min;
    }

    this.readout.textContent = this.valueToString(value);
    if (this.model.get('value') !== value) {
      this.model.set('value', value, { updated_view: this });
      this.touch();
    }
  }

  valueToString(value: number | number[]): string {
    const format = this.model.readout_formatter;
    return format(value);
  }

  stringToValue(text: string): number | number[] {
    return this._parse_value(text);
  }

  handleTextChange(): void {
    let value = this.stringToValue(this.readout.textContent ?? '');
    const vmin = this.model.get('min');
    const vmax = this.model.get('max');

    if (isNaN(value as number)) {
      this.readout.textContent = this.valueToString(this.model.get('value'));
    } else {
      value = Math.max(Math.min(value as number, vmax), vmin);

      if (value !== this.model.get('value')) {
        this.readout.textContent = this.valueToString(value);
        this.model.set('value', value);
        this.touch();
      } else {
        this.readout.textContent = this.valueToString(this.model.get('value'));
      }
    }
  }

  handleSliderChangeEvent(values: any, handle: any): void {
    const actual_value = values.map(this._validate_slide_value);
    this.readout.textContent = this.valueToString(actual_value);

    this.handleSliderChanged(values, handle);
  }

  handleSliderUpdateEvent(values: any, handle: any): void {
    const actual_value = values.map(this._validate_slide_value);
    this.readout.textContent = this.valueToString(actual_value);

    // Only persist the value while sliding if the continuous_update
    // trait is set to true.
    if (this.model.get('continuous_update')) {
      this.handleSliderChanged(values, handle);
    }
  }

  handleSliderChanged(values: any, handle: any): void {
    const actual_value = this._validate_slide_value(values[handle]);
    const model_value = this.model.get('value');

    if (parseFloat(model_value) !== actual_value) {
      this.model.set('value', actual_value, { updated_view: this });
      this.touch();
    }
  }

  updateSliderOptions(e: any): void {
    this.$slider.noUiSlider.updateOptions({
      start: this.model.get('value'),
      range: {
        min: this.model.get('min'),
        max: this.model.get('max'),
      },
      step: this.model.get('step'),
    });
  }

  updateSliderValue(model: any, _: any, options: any): void {
    if (options.updated_view === this) {
      return;
    }

    const prev_value = this.$slider.noUiSlider.get();
    const value = this.model.get('value');

    if (prev_value !== value) {
      this.$slider.noUiSlider.set(value);
    }
  }
}

export class IntTextModel extends IntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'IntTextModel',
      _view_name: 'IntTextView',
      disabled: false,
      continuous_update: false,
    };
  }
}

export class BoundedIntTextModel extends BoundedIntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'BoundedIntTextModel',
      _view_name: 'IntTextView',
      disabled: false,
      continuous_update: false,
      step: 1,
    };
  }
}

export class IntTextView extends DescriptionView {
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-text');

    this.textbox = document.createElement('input');
    this.textbox.type = 'number';
    this.textbox.required = true;
    this.textbox.id = this.label.htmlFor = uuid();
    this.el.appendChild(this.textbox);

    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (options === undefined || options.updated_view !== this) {
      const value: number = this.model.get('value');

      if (this._parse_value(this.textbox.value) !== value) {
        this.textbox.value = value.toString();
      }
      if (this.model.get('min') !== undefined) {
        this.textbox.min = this.model.get('min');
      }
      if (this.model.get('max') !== undefined) {
        this.textbox.max = this.model.get('max');
      }
      if (
        this.model.get('step') !== undefined &&
        this.model.get('step') !== null
      ) {
        this.textbox.step = this.model.get('step');
      } else {
        this.textbox.step = this._default_step;
      }
      this.textbox.disabled = this.model.get('disabled');
    }
    return super.update();
  }

  events(): { [e: string]: string } {
    return {
      'keydown input': 'handleKeyDown',
      'keypress input': 'handleKeypress',
      'keyup input': 'handleKeyUp',
      'input input': 'handleChanging',
      'change input': 'handleChanged',
    };
  }

  /**
   * Handle key down
   *
   * Stop propagation so the event isn't sent to the application.
   */
  handleKeyDown(e: KeyboardEvent): void {
    e.stopPropagation();
  }

  /**
   * Handles key press
   */
  handleKeypress(e: KeyboardEvent): void {
    if (/[e,. ]/.test(String.fromCharCode(e.keyCode))) {
      e.preventDefault();
    }
  }

  /**
   * Handle key up
   */
  handleKeyUp(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey) {
      return;
    }
    const target = e.target as HTMLInputElement;
    /* remove invalid characters */
    let value = target.value;

    value = value.replace(/[e,.\s]/g, '');

    if (value.length >= 1) {
      const subvalue = value.substr(1);
      value = value[0] + subvalue.replace(/[+-]/g, '');
    }

    if (target.value !== value) {
      e.preventDefault();
      target.value = value;
    }
  }

  /**
   * Call the submit handler if continuous update is true and we are not
   * obviously incomplete.
   */
  handleChanging(e: Event): void {
    const target = e.target as HTMLInputElement;

    const trimmed = target.value.trim();
    if (trimmed === '' || ['-', '-.', '.', '+.', '+'].indexOf(trimmed) >= 0) {
      // incomplete number
      return;
    }

    if (this.model.get('continuous_update')) {
      this.handleChanged(e);
    }
  }

  /**
   * Applies validated input.
   */
  handleChanged(e: Event): void {
    const target = e.target as HTMLInputElement;
    let numericalValue = this._parse_value(target.value);

    // If parse failed, reset value to value stored in model.
    if (isNaN(numericalValue)) {
      target.value = this.model.get('value');
    } else {
      // Handle both the unbounded and bounded case by
      // checking to see if the max/min properties are defined
      let boundedValue = numericalValue;
      if (this.model.get('max') !== undefined) {
        boundedValue = Math.min(this.model.get('max'), boundedValue);
      }
      if (this.model.get('min') !== undefined) {
        boundedValue = Math.max(this.model.get('min'), boundedValue);
      }
      if (boundedValue !== numericalValue) {
        target.value = boundedValue as any;
        numericalValue = boundedValue;
      }

      // Apply the value if it has changed.
      if (numericalValue !== this.model.get('value')) {
        this.model.set('value', numericalValue, { updated_view: this });
        this.touch();
      }
    }
  }

  _parse_value = parseInt;
  _default_step = '1';
  textbox: HTMLInputElement;
}

export class ProgressStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return { ...super.defaults(), _model_name: 'ProgressStyleModel' };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    bar_color: {
      selector: '.progress-bar',
      attribute: 'background-color',
      default: null as any,
    },
  };
}

export class IntProgressModel extends BoundedIntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'IntProgressModel',
      _view_name: 'ProgressView',
      orientation: 'horizontal',
      bar_style: '',
      style: null,
    };
  }
}

export class ProgressView extends DescriptionView {
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.listenTo(this.model, 'change:bar_style', this.update_bar_style);
    this.luminoWidget.addClass('jupyter-widgets');
  }

  render(): void {
    super.render();
    const orientation = this.model.get('orientation');
    const className =
      orientation === 'horizontal' ? 'widget-hprogress' : 'widget-vprogress';
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
  update(): void {
    const value = this.model.get('value');
    const max = this.model.get('max');
    const min = this.model.get('min');
    const orientation = this.model.get('orientation');
    const percent = (100.0 * (value - min)) / (max - min);
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

  update_bar_style(): void {
    this.update_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
  }

  set_bar_style(): void {
    this.set_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
  }

  progress: HTMLDivElement;
  bar: HTMLDivElement;

  static class_map = {
    success: ['progress-bar-success'],
    info: ['progress-bar-info'],
    warning: ['progress-bar-warning'],
    danger: ['progress-bar-danger'],
  };
}

export class PlayModel extends BoundedIntModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'PlayModel',
      _view_name: 'PlayView',
      repeat: false,
      playing: false,
      show_repeat: true,
      interval: 100,
      step: 1,
      disabled: false,
    };
  }
  initialize(
    attributes: any,
    options: { model_id: string; comm: any; widget_manager: any }
  ): void {
    super.initialize(attributes, options);
  }

  loop(): void {
    if (!this.get('playing')) {
      return;
    }
    const next_value = this.get('value') + this.get('step');
    if (next_value <= this.get('max')) {
      this.set('value', next_value);
      this.schedule_next();
    } else {
      if (this.get('repeat')) {
        this.set('value', this.get('min'));
        this.schedule_next();
      } else {
        this.pause();
      }
    }
    this.save_changes();
  }

  schedule_next(): void {
    this._timerId = window.setTimeout(
      this.loop.bind(this),
      this.get('interval')
    );
  }

  stop(): void {
    this.pause();
    this.set('value', this.get('min'));
    this.save_changes();
  }

  pause(): void {
    window.clearTimeout(this._timerId);
    this._timerId = undefined;
    this.set('playing', false);
    this.save_changes();
  }

  animate(): void {
    if (this._timerId !== undefined) {
      return;
    }
    if (this.get('value') === this.get('max')) {
      // if the value is at the end, reset it first, and then schedule the next
      this.set('value', this.get('min'));
      this.schedule_next();
      this.save_changes();
    } else {
      // otherwise directly start with the next value
      // loop will call save_changes in this case
      this.loop();
    }
    this.save_changes();
  }

  play(): void {
    this.set('playing', !this.get('playing'));
    this.save_changes();
  }

  repeat(): void {
    this.set('repeat', !this.get('repeat'));
    this.save_changes();
  }

  private _timerId: number | undefined;
}

export class PlayView extends DOMWidgetView {
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-play');

    this.playPauseButton = document.createElement('button');
    this.stopButton = document.createElement('button');
    this.repeatButton = document.createElement('button');

    this.playPauseButton.className = 'jupyter-button';
    this.stopButton.className = 'jupyter-button';
    this.repeatButton.className = 'jupyter-button';

    this.el.appendChild(this.playPauseButton); // Toggle button with playing
    this.el.appendChild(this.stopButton); // Disable if not playing
    this.el.appendChild(this.repeatButton); // Always enabled, but may be hidden

    const playIcon = document.createElement('i');
    playIcon.className = 'fa fa-play';
    this.playPauseButton.appendChild(playIcon);
    const stopIcon = document.createElement('i');
    stopIcon.className = 'fa fa-stop';
    this.stopButton.appendChild(stopIcon);
    const repeatIcon = document.createElement('i');
    repeatIcon.className = 'fa fa-retweet';
    this.repeatButton.appendChild(repeatIcon);

    this.playPauseButton.onclick = this.model.play.bind(this.model);
    this.stopButton.onclick = this.model.stop.bind(this.model);
    this.repeatButton.onclick = this.model.repeat.bind(this.model);

    this.listenTo(this.model, 'change:playing', this.onPlayingChanged);
    this.listenTo(this.model, 'change:repeat', this.updateRepeat);
    this.listenTo(this.model, 'change:show_repeat', this.updateRepeat);
    this.updatePlaying();
    this.updateRepeat();
    this.update();
  }

  update(): void {
    const disabled = this.model.get('disabled');
    this.playPauseButton.disabled = disabled;
    this.stopButton.disabled = disabled;
    this.repeatButton.disabled = disabled;
    this.updatePlaying();
  }

  onPlayingChanged(): void {
    this.updatePlaying();
    const previous = this.model.previous('playing');
    const current = this.model.get('playing');
    if (!previous && current) {
      this.model.animate();
    } else {
      this.model.pause();
    }
  }

  updatePlaying(): void {
    const playing = this.model.get('playing');
    const icon = this.playPauseButton.getElementsByTagName('i')[0];
    if (playing) {
      icon.className = 'fa fa-pause';
    } else {
      icon.className = 'fa fa-play';
    }
  }

  updateRepeat(): void {
    const repeat = this.model.get('repeat');
    this.repeatButton.style.display = this.model.get('show_repeat')
      ? this.playPauseButton.style.display
      : 'none';
    if (repeat) {
      this.repeatButton.classList.add('mod-active');
    } else {
      this.repeatButton.classList.remove('mod-active');
    }
  }

  playPauseButton: HTMLButtonElement;
  stopButton: HTMLButtonElement;
  repeatButton: HTMLButtonElement;
  model: PlayModel;
}
