// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var _ = require('underscore');
var widget = require('./widget');
var int_widgets = require('./widget_int');
var d3format = require('d3-format').format;


var FloatModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: "FloatModel",
        value: 0,
        disabled: false,
        description: ""
    }),
});


var BoundedFloatModel = FloatModel.extend({
    defaults: _.extend({}, FloatModel.prototype.defaults, {
        _model_name: "BoundedFloatModel",
        step: 1.0,
        max: 100.0,
        min: 0.0
    }),
});


var FloatSliderModel = BoundedFloatModel.extend({
    defaults: _.extend({}, BoundedFloatModel.prototype.defaults, {
        _model_name: "FloatSliderModel",
        _view_name: "FloatSliderView",
        orientation: "horizontal",
        _range: false,
        readout: true,
        readout_format: '.2f',
        slider_color: null,
        continuous_update: true
    }),

    initialize: function () {
        FloatSliderModel.__super__.initialize.apply(this, arguments);
        this.on('change:readout_format', this.update_readout_format, this);
        this.update_readout_format();
    },

    update_readout_format: function() {
        this.readout_formatter = d3format(this.get('readout_format'));
    }
});


var IntSliderView = int_widgets.IntSliderView;
var IntTextView = int_widgets.IntTextView;

var FloatSliderView = IntSliderView.extend({
    _parse_value: parseFloat,

    // matches: whitespace?, float, whitespace?, [-:], whitespace?, float
    _range_regex: /^\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][+-]?\d+)?)\s*[-:]\s*([+-]?(?:\d*\.?\d+|\d+\.)(?:[eE][+-]?\d+)?)/,

    _validate_slide_value: function(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         */
        return x;
    },
});


var FloatTextModel = FloatModel.extend({
    defaults: _.extend({}, FloatModel.prototype.defaults, {
        _model_name: "FloatTextModel",
        _view_name: "FloatTextView"
    }),
});


var FloatTextView = IntTextView.extend({
    _parse_value: parseFloat
});


module.exports = {
    FloatSliderModel: FloatSliderModel,
    FloatTextModel: FloatTextModel,
    FloatSliderView: FloatSliderView,
    FloatTextView: FloatTextView
};
