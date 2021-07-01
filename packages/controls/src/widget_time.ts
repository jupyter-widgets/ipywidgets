// Copyright (c) Vidar Tonaas Fauske
// Distributed under the terms of the Modified BSD License.

import { ISerializers } from '@jupyter-widgets/base';

import { uuid } from './utils';

import { DescriptionView } from './widget_description';

import { CoreDescriptionModel } from './widget_core';

const PARSER = /(\d\d):(\d\d)(:(\d\d)(.(\d{1,3})\d*)?)?/;

export interface ISerializedTime {
  /**
   * Integer hour (24H format)
   */
  hours: number;

  /**
   * Integer minutes
   */
  minutes: number;

  /**
   * Integer seconds
   */
  seconds: number;

  /**
   * Millisconds
   */
  milliseconds: number;
}

export function serialize_time(value: string): ISerializedTime | null {
  if (value === null) {
    return null;
  } else {
    const res = PARSER.exec(value);
    if (res === null) {
      return null;
    }
    return {
      hours: Math.min(23, parseInt(res[1], 10)),
      minutes: Math.min(59, parseInt(res[2], 10)),
      seconds: res[4] ? Math.min(59, parseInt(res[4], 10)) : 0,
      milliseconds: res[6] ? parseInt(res[6], 10) : 0
    };
  }
}

export function deserialize_time(value: ISerializedTime): string | null {
  if (value === null) {
    return null;
  } else {
    const parts = [
      `${value.hours
        .toString()
        .padStart(2, '0')}:${value.minutes.toString().padStart(2, '0')}`
    ];
    if (value.seconds > 0 || value.milliseconds > 0) {
      parts.push(`:${value.seconds.toString().padStart(2, '0')}`);
      if (value.milliseconds > 0) {
        parts.push(`.${value.milliseconds.toString().padStart(3, '0')}`);
      }
    }
    return parts.join('');
  }
}

export const time_serializers = {
  serialize: serialize_time,
  deserialize: deserialize_time
};

export class TimeModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: TimeModel.model_name,
      _view_name: TimeModel.view_name,
      value: null,
      disabled: false,
      min: null,
      max: null,
      step: 60
    };
  }

  static serializers: ISerializers = {
    ...CoreDescriptionModel.serializers,
    value: time_serializers,
    min: time_serializers,
    max: time_serializers
  };

  static model_name = 'TimeModel';
  static view_name = 'TimeView';
}

export class TimeView extends DescriptionView {
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-timepicker');

    this._timepicker = document.createElement('input');
    this._timepicker.setAttribute('type', 'time');
    this._timepicker.id = this.label.htmlFor = uuid();

    this.el.appendChild(this._timepicker);

    this.listenTo(this.model, 'change:value', this._update_value);
    this.listenTo(this.model, 'change', this.update2);
    this._update_value();
    this.update2();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update2(model?: Backbone.Model, options?: any): void {
    if (options === undefined || options.updated_view !== this) {
      this._timepicker!.disabled = this.model.get('disabled');
      this._timepicker!.min = this.model.get('min');
      this._timepicker!.max = this.model.get('max');
      this._timepicker!.step = this.model.get('step');
    }
    return super.update();
  }

  events(): { [e: string]: string } {
    // Typescript doesn't understand that these functions are called, so we
    // specifically use them here so it knows they are being used.
    void this._picker_change;
    void this._picker_focusout;
    return {
      'change [type="time"]': '_picker_change',
      'focusout [type="time"]': '_picker_focusout'
    };
  }

  private _update_value(
    model?: Backbone.Model,
    newValue?: any,
    options?: any
  ): void {
    if (options === undefined || options.updated_view !== this) {
      this._timepicker!.value = this.model.get('value');
    }
  }

  private _picker_change(): void {
    if (!this._timepicker!.validity.badInput) {
      this.model.set('value', this._timepicker!.value, { updated_view: this });
      this.touch();
    }
  }

  private _picker_focusout(): void {
    if (this._timepicker!.validity.badInput) {
      this.model.set('value', null, { updated_view: this });
      this.touch();
    }
  }

  private _timepicker: HTMLInputElement | undefined;
}
