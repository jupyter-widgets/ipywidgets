// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DescriptionView
} from './widget_description';

import {
    CoreDescriptionModel
} from './widget_core';

import {
    uuid
} from './utils';

import * as _ from 'underscore';

export
function serialize_date(value: Date) {
    if (value === null) {
        return null;
    } else {
        return {
            year: value.getUTCFullYear(),
            month: value.getUTCMonth(),
            date: value.getUTCDate()
        };
    }
}

export interface SerializedDate {
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

export
function deserialize_date(value: SerializedDate) {
    if (value === null) {
        return null;
    } else {
        let date = new Date();
        date.setUTCFullYear(value.year, value.month, value.date);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }
}

export
class DatePickerModel extends CoreDescriptionModel {
    static serializers = {
        ...CoreDescriptionModel.serializers,
        value: {
            serialize: serialize_date,
            deserialize: deserialize_date
        }
    };

    defaults() {
        return _.extend(super.defaults(), {
            value: null,
            _model_name: 'DatePickerModel',
            _view_name: 'DatePickerView'
        });
    }
}

export
class DatePickerView extends DescriptionView {
    render() {
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
    update(options?) {
        if (options === undefined || options.updated_view != this) {
            this._datepicker.disabled = this.model.get('disabled');
        }
        return super.update();
    }

    events(): {[e: string]: string} {
        return {
            'change [type="date"]': '_picker_change',
        };
    }

    private _update_value() {
        const value = this.model.get('value');
        this._datepicker.valueAsDate = value;
    }

    private _picker_change() {
        if (!this._datepicker.validity.badInput) {
            this.model.set('value', this._datepicker.valueAsDate);
            this.touch();
        }
    }

    private _datepicker: HTMLInputElement;
}
