// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    LabeledDOMWidgetView
} from './widget';

import {
    CoreLabeledDOMWidgetModel
} from './widget_core';

import * as _ from 'underscore';

export
function serialize_datetime(value, manager) {
    if (value === null) {
        return null;
    } else {
        value = new Date(value);
        return {
            year: value.getFullYear(),
            month: value.getMonth(),
            date: value.getDate(),
            hours: value.getHours(),
            minutes: value.getMinutes(),
            seconds: value.getSeconds(),
            milliseconds: value.getMilliseconds()
        };
    }
};

export
function deserialize_datetime(value, manager) {
    if (value === null) {
        return null;
    } else {
        return new Date(
            value.year,
            value.month,
            value.date,
            value.hours,
            value.minutes,
            value.seconds,
            value.milliseconds
        );
    }
};

function createDateAsUTC(date) {
    if (date === null) {
        return null;
    } else {
        return new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
            )
        );
    }
}

function convertDateToUTC(date) {
    if (date === null) {
        return null;
    } else {
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds()
        );
    }
}

export
class DatePickerModel extends CoreLabeledDOMWidgetModel {
    static serializers = {
        ...CoreLabeledDOMWidgetModel.serializers,
        value: {
            serialize: serialize_datetime,
            deserialize: deserialize_datetime
        }
    }

    defaults() {
        return _.extend(super.defaults(), {
            value: null,
            _model_name: 'DatePickerModel',
            _view_name: 'DatePickerView'
        });
    }
}

export
class DatePickerView extends LabeledDOMWidgetView {
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-datepicker');

        this._datepicker = document.createElement('input');
        this._datepicker.setAttribute('type', 'date');
        this.el.appendChild(this._datepicker);

        this.listenTo(this.model, 'change:value', this._update_value);
        this._update_value();
    }

    events(): {[e: string]: string} {
        return {
            'change [type="date"]': '_picker_change',
        }
    }

    private _update_value() {
        var value = this.model.get('value');
        this._datepicker.valueAsDate = createDateAsUTC(value);
    }

    private _picker_change() {
        this.model.set('value', convertDateToUTC(this._datepicker.valueAsDate));
        this.touch();
    }

    _datepicker: HTMLInputElement;
}
