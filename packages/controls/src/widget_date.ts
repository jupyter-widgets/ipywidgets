// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DescriptionView } from './widget_description';

import { CoreDescriptionModel } from './widget_core';

import { uuid } from './utils';

export interface ISerializedDate {
  /**
   * Full year
   */
  year: number;

  /**
   * Zero-based month (0 means January, 11 means December)
   */
  month: number;

  /**
   * Day of month
   */
  date: number;
}

export function serialize_date(value: Date | null): ISerializedDate | null {
  if (value === null) {
    return null;
  } else {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth(),
      date: value.getUTCDate(),
    };
  }
}

export function deserialize_date(value: ISerializedDate | null): Date | null {
  if (value === null) {
    return null;
  } else {
    const date = new Date();
    date.setUTCFullYear(value.year, value.month, value.date);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
}

export class DatePickerModel extends CoreDescriptionModel {
  static serializers = {
    ...CoreDescriptionModel.serializers,
    value: {
      serialize: serialize_date,
      deserialize: deserialize_date,
    },
  };

  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: null,
      _model_name: 'DatePickerModel',
      _view_name: 'DatePickerView',
    };
  }
}

export class DatePickerView extends DescriptionView {
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-datepicker');

    this._datepicker = document.createElement('input');
    this._datepicker.setAttribute('type', 'date');
    this._datepicker.id = this.label.htmlFor = uuid();

    this.el.appendChild(this._datepicker);

    this.listenTo(this.model, 'change:value', this._update_value);
    this._update_value();
    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (options === undefined || options.updated_view !== this) {
      this._datepicker.disabled = this.model.get('disabled');
    }
    return super.update();
  }

  events(): { [e: string]: string } {
    // Typescript doesn't understand that these functions are called, so we
    // specifically use them here so it knows they are being used.
    void this._picker_change;
    void this._picker_focusout;
    return {
      'change [type="date"]': '_picker_change',
      'focusout [type="date"]': '_picker_focusout',
    };
  }

  private _update_value(): void {
    const value = this.model.get('value');
    this._datepicker.valueAsDate = value;
  }

  private _picker_change(): void {
    if (!this._datepicker.validity.badInput) {
      this.model.set('value', this._datepicker.valueAsDate);
      this.touch();
    }
  }

  private _picker_focusout(): void {
    if (this._datepicker.validity.badInput) {
      this.model.set('value', null);
      this.touch();
    }
  }

  private _datepicker: HTMLInputElement;
}
