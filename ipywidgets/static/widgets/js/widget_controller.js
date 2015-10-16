// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "nbextensions/widgets/widgets/js/widget",
    "base/js/utils",
], function(widget, utils) {
    'use strict';

    var Button = widget.DOMWidgetView.extend({
        /* Very simple view for a gamepad button. */

        render : function(){
            this.$support = $('<div />').css({
                    'position': 'relative',
                    'margin': '1px',
                    'width': '16px',
                    'height': '16px',
                    'border': '1px solid black',
                    'background': 'lightgray',
                })
                .appendTo(this.$el);
            this.$bar = $('<div />')
                .css({
                    'position': 'absolute',
                    'width': '100%',
                    'bottom': 0,
                    'background': 'gray',
                })
                .appendTo(this.$support);
            this.$label = $('<div />')
                .text(this.model.get('description'))
                .css('text-align', 'center')
                .appendTo(this.$el);
            this.update();
        },

        update : function() {
            this.$bar.css('height', 100 * this.model.get('value') + '%');
        },

    });

    var Axis = widget.DOMWidgetView.extend({
        /* Very simple view for a gamepad axis. */

        render : function() {
            this.$el.css({
                    'width': '16px',
                    'padding': '4px',
                });
            this.$support = $('<div />').css({
                    'position': 'relative',
                    'margin': '1px',
                    'width': '4px',
                    'height': '64px',
                    'border': '1px solid black',
                    'background': 'lightgray',
                })
                .appendTo(this.$el);
            this.$bullet = $('<div />')
                .css({
                    'position': 'absolute',
                    'margin': '-4px',
                    'width': '10px',
                    'height': '10px',
                    'background': 'gray',
                })
                .appendTo(this.$support);
            this.$label = $('<div />')
                .text(this.model.get('description'))
                .css('text-align', 'center')
                .appendTo(this.$el);
            this.update();
        },

        update : function() {
            this.$bullet.css('top', 50 * (this.model.get('value') + 1) + '%');
        },

    });

    var Controller = widget.WidgetModel.extend({
        /* The Controller model. */

        initialize: function() {
            if (navigator.getGamepads === void 0) {
                // Checks if the browser supports the gamepad API
                this.readout = 'This browser does not support gamepads.';
                console.error(this.readout);
            } else {
                // Start the wait loop, and listen to updates of the only
                // user-provided attribute, the gamepad index.
                this.readout = 'Connect gamepad and press any button.';
                // Wait for the state to be provided by the backend.
                this.on('ready', function() {
                    if (this.get('connected')) {
                        // No need to re-create Button and Axis widgets, re-use
                        // the models provided by the backend which may already
                        // be wired to other things.
                        this.update_loop();
                    } else {
                        // Wait for a gamepad to be connected.
                        this.wait_loop();
                    }
                }, this);
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
                timestamp: pad.timestamp,
            });
            // Create buttons and axes. When done, start the update loop
            var that = this;
            return utils.resolve_promises_dict({
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
                    connected: pad.connected,
                });
                this.save_changes();
                this.get('buttons').forEach(function(model, index) {
                    model.set({
                        value: pad.buttons[index].value,
                        pressed: pad.buttons[index].pressed,
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
                axes: [],
            });
            this.save_changes();
            window.requestAnimationFrame(this.wait_loop.bind(this));
        },

        _create_button_model: function(index) {
            /* Creates a gamepad button widget.
             */
            return this.widget_manager.new_widget({
                 model_name: 'WidgetModel',
                 widget_class: 'ipywidgets.widgets.widget_controller.Button',
            }).then(function(model) {
                 model.set('description', index);
                 return model;
            });
        },

        _create_axis_model: function(index) {
            /* Creates a gamepad axis widget.
             */
            return this.widget_manager.new_widget({
                 model_name: 'WidgetModel',
                 widget_class: 'ipywidgets.widgets.widget_controller.Axis',
            }).then(function(model) {
                 model.set('description', index);
                 return model;
            });
        },

    }, {

        serializers: _.extend({
            buttons: {deserialize: widget.unpack_models},
            axes: {deserialize: widget.unpack_models},
        }, widget.WidgetModel.serializers)

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
            this.$box = this.$el;

            this.$label = $('<div />')
                .appendTo(this.$box);

            this.$axis_box = $('<div />')
                .css('display', 'flex')
                .appendTo(this.$box);

            this.$button_box = $('<div />')
                .css('display', 'flex')
                .appendTo(this.$box);

            this.button_views.update(this.model.get('buttons'));
            this.axis_views.update(this.model.get('axes'));

            this.update_label();
        },

        update_label: function() {
            this.$label.text(this.model.get('name') || this.model.readout);
        },

        add_button: function(model) {
            var that = this;
            var dummy = $('<div/>');
            that.$button_box.append(dummy);
            return this.create_child_view(model).then(function(view) {
                dummy.replaceWith(view.el);
                that.displayed.then(function() {
                    view.trigger('displayed');
                });
                return view;
            }).catch(utils.reject('Could not add button view', true));
        },

        add_axis: function(model) {
            var that = this;
            var dummy = $('<div/>');
            that.$axis_box.append(dummy);
            return this.create_child_view(model).then(function(view) {
                dummy.replaceWith(view.el);
                that.displayed.then(function() {
                    view.trigger('displayed');
                });
                return view;
            }).catch(utils.reject('Could not add axis view', true));
        },

        remove: function() {
            ControllerView.__super__.remove.apply(this, arguments);
            this.button_views.remove();
            this.axis_views.remove();
        },

    });

    return {
        ControllerButton: Button,
        ControllerAxis: Axis,
        Controller: Controller,
        ControllerView: ControllerView,
    };
});
