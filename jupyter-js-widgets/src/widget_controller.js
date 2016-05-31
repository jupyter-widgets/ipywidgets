// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils= require('./utils');
var _ = require('underscore');

var ControllerButtonModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'ControllerButtonModel',
        _view_name: 'ControllerButtonView',
        value: 0.0,
        pressed: false
    })
});

var ControllerButtonView = widget.DOMWidgetView.extend({
    /* Very simple view for a gamepad button. */

    render: function() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-controller-button');

        this.support = document.createElement('div');
        this.support.style.position = 'relative';
        this.support.style.margin = '1px';
        this.support.style.width = '16px';
        this.support.style.height = '16px';
        this.support.style.border = '1px solid black';
        this.support.style.background = 'lightgray';
        this.el.appendChild(this.support);

        this.bar = document.createElement('div');
        this.bar.style.position = 'absolute';
        this.bar.style.width = '100%';
        this.bar.style.bottom = 0;
        this.bar.style.background = 'gray';
        this.support.appendChild(this.bar);

        this.update();
        this.label = document.createElement('div');
        this.label.textContent = this.model.get('description');
        this.label.style.textAlign = 'center';
        this.el.appendChild(this.label);
    },

    update: function() {
        this.bar.style.height = 100 * this.model.get('value') + '%';
    }
});

var ControllerAxisModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'ControllerAxisModel',
        _view_name: 'ControllerAxisView',
        value: 0.0
    })
});

var ControllerAxisView = widget.DOMWidgetView.extend({
    /* Very simple view for a gamepad axis. */
    render: function() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-controller-axis');
        this.el.style.width = '16px';
        this.el.style.padding = '4px';

        this.support = document.createElement('div');
        this.support.style.position = 'relative';
        this.support.style.margin = '1px';
        this.support.style.width = '4px';
        this.support.style.height = '64px';
        this.support.style.border = '1px solid black';
        this.support.style.background = 'lightgray';

        this.bullet = document.createElement('div');
        this.bullet.style.position = 'absolute';
        this.bullet.style.margin = '-4px';
        this.bullet.style.width = '10px';
        this.bullet.style.height = '10px';
        this.bullet.style.background = 'gray';

        this.label = document.createElement('div');
        this.label.textContent = this.model.get('description');
        this.label.style.textAlign = 'center';

        this.support.appendChild(this.bullet);
        this.el.appendChild(this.support);
        this.el.appendChild(this.label);

        this.update();
    },

    update: function() {
        this.bullet.style.top = 50 * (this.model.get('value') + 1) + '%';
    }

});

var ControllerModel = widget.DOMWidgetModel.extend({
    /* The Controller model. */
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'ControllerModel',
        _view_name: 'ControllerView',
        index: 0,
        name: '',
        mapping: '',
        connected: false,
        timestamp: 0,
        buttons: [],
        axes: []
    }),

    initialize: function() {
        if (navigator.getGamepads === void 0) {
            // Checks if the browser supports the gamepad API
            this.readout = 'This browser does not support gamepads.';
            console.error(this.readout);
        } else {
            // Start the wait loop, and listen to updates of the only
            // user-provided attribute, the gamepad index.
            this.readout = 'Connect gamepad and press any button.';
            if (this.get('connected')) {
                // No need to re-create Button and Axis widgets, re-use
                // the models provided by the backend which may already
                // be wired to other things.
                this.update_loop();
            } else {
                 // Wait for a gamepad to be connected.
                this.wait_loop();
            }
        }
    },

    wait_loop: function() {
        /* Waits for a gamepad to be connected at the provided index.
         * Once one is connected, it will start the update loop, which
         * populates the update of axes and button values.
         */
        var index = this.get('index');
        var pad = navigator.getGamepads()[index];
        if (pad) {
            var that = this;
            this.setup(pad).then(function(controls) {
                that.set(controls);
                that.save_changes();
                window.requestAnimationFrame(that.update_loop.bind(that));
            });
        } else {
            window.requestAnimationFrame(this.wait_loop.bind(this));
        }
    },

    setup: function(pad) {
        /* Given a native gamepad object, returns a promise for a dictionary of
         * controls, of the form
         * {
         *     buttons: list of Button models,
         *     axes: list of Axis models,
         * }
         */
        // Set up the main gamepad attributes
        this.set({
            name: pad.id,
            mapping: pad.mapping,
            connected: pad.connected,
            timestamp: pad.timestamp
        });
        // Create buttons and axes. When done, start the update loop
        var that = this;
        return utils.resolvePromisesDict({
            buttons: Promise.all(pad.buttons.map(function(btn, index) {
                return that._create_button_model(index);
            })),
            axes: Promise.all(pad.axes.map(function(axis, index) {
                return that._create_axis_model(index);
            })),
        });
    },

    update_loop: function() {
        /* Update axes and buttons values, until the gamepad is disconnected.
         * When the gamepad is disconnected, this.reset_gamepad is called.
         */
        var index = this.get('index');
        var id = this.get('name');
        var pad = navigator.getGamepads()[index];
        if (pad && index === pad.index && id === pad.id) {
            this.set({
                timestamp: pad.timestamp,
                connected: pad.connected
            });
            this.save_changes();
            this.get('buttons').forEach(function(model, index) {
                model.set({
                    value: pad.buttons[index].value,
                    pressed: pad.buttons[index].pressed
                });
                model.save_changes();
            });
            this.get('axes').forEach(function(model, index) {
                model.set('value', pad.axes[index]);
                model.save_changes();
            });
            window.requestAnimationFrame(this.update_loop.bind(this));
        } else {
            this.reset_gamepad();
        }
    },

    reset_gamepad: function() {
        /* Resets the gamepad attributes, and start the wait_loop.
         */
        this.get('buttons').forEach(function(button) {
            button.close();
        });
        this.get('axes').forEach(function(axis) {
            axis.close();
        });
        this.set({
            name: '',
            mapping: '',
            connected: false,
            timestamp: 0.0,
            buttons: [],
            axes: []
        });
        this.save_changes();
        window.requestAnimationFrame(this.wait_loop.bind(this));
    },

    _create_button_model: function(index) {
        /* Creates a gamepad button widget.
         */
        return this.widget_manager.new_widget({
             model_name: 'ControllerButtonModel',
             model_module: 'jupyter-js-widgets',
             widget_class: 'Jupyter.ControllerButton',
        }).then(function(model) {
             model.set('description', index);
             return model;
        });
    },

    _create_axis_model: function(index) {
        /* Creates a gamepad axis widget.
         */
        return this.widget_manager.new_widget({
             model_name: 'ControllerAxisModel',
             model_module: 'jupyter-js-widgets',
             widget_class: 'Jupyter.ControllerAxis',
        }).then(function(model) {
             model.set('description', index);
             return model;
        });
    }

}, {
    serializers: _.extend({
        buttons: {deserialize: widget.unpack_models},
        axes: {deserialize: widget.unpack_models}
    }, widget.DOMWidgetModel.serializers)
});

var ControllerView = widget.DOMWidgetView.extend({
    /* A simple view for a gamepad. */

    initialize: function() {
        ControllerView.__super__.initialize.apply(this, arguments);

        this.button_views = new widget.ViewList(this.add_button, null, this);
        this.listenTo(this.model, 'change:buttons', function(model, value) {
            this.button_views.update(value);
        }, this);

        this.axis_views = new widget.ViewList(this.add_axis, null, this);
        this.listenTo(this.model, 'change:axes', function(model, value) {
            this.axis_views.update(value);
        }, this);

        this.listenTo(this.model, 'change:name', this.update_label, this);
    },

    render: function(){
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-controller');
        this.box = this.el;
        this.label = document.createElement('div');
        this.box.appendChild(this.label);
        this.axis_box = document.createElement('div');
        this.axis_box.style.display = 'flex';
        this.box.appendChild(this.axis_box);

        this.button_box = document.createElement('div');
        this.button_box.style.display = 'flex';
        this.box.appendChild(this.button_box);

        this.button_views.update(this.model.get('buttons'));
        this.axis_views.update(this.model.get('axes'));

        this.update_label();
    },

    update_label: function() {
        this.label.textContent = this.model.get('name') || this.model.readout;
    },

    add_button: function(model) {
        var that = this;
        var dummy = document.createElement('div');

        that.button_box.appendChild(dummy);
        return this.create_child_view(model).then(function(view) {
            that.button_box.replaceChild(view.el, dummy);
            that.displayed.then(function() {
                view.trigger('displayed', that);
            });
            return view;
        }).catch(utils.reject('Could not add button view', true));
    },

    add_axis: function(model) {
        var that = this;
        var dummy = document.createElement('div');

        that.axis_box.appendChild(dummy);
        return this.create_child_view(model).then(function(view) {
            that.axis_box.replaceChild(view.el, dummy);
            that.displayed.then(function() {
                view.trigger('displayed', that);
            });
            return view;
        }).catch(utils.reject('Could not add axis view', true));
    },

    remove: function() {
        ControllerView.__super__.remove.apply(this, arguments);
        this.button_views.remove();
        this.axis_views.remove();
    }

});

module.exports = {
    ControllerButtonView: ControllerButtonView,
    ControllerButtonModel: ControllerButtonModel,
    ControllerAxisView: ControllerAxisView,
    ControllerAxisModel: ControllerAxisModel,
    ControllerModel: ControllerModel,
    ControllerView: ControllerView
};
