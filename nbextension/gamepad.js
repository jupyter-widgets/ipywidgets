define([
    "widgets/js/widget", 
    "base/js/utils", 
    "underscore",
], function(widget, utils, _) {
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
                .text(this.model.index)
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
                .text(this.model.index)
                .css('text-align', 'center')
                .appendTo(this.$el);
            this.update();
        },

        update : function() {
            this.$bullet.css('top', 50 * (this.model.get('value') + 1) + '%');
        },
    });

    var Gamepad = widget.WidgetModel.extend({
        /* The Gamepad model. */
        initialize: function() {
            if (navigator.getGamepads === void 0) {
                // Checks if the browser supports the gamepad API
                console.error('This browser does not support gamepads.');
            } else {
                // Start the wait loop, and listen to updates of the only
                // user-provided attribute, the gamepad index.
                this.wait_loop();
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
                this.index = index;
                // Set up the main gamepad attributes
                this.set({
                    name: pad.id,
                    mapping: pad.mapping,
                    connected: pad.connected,
                    timestamp: pad.timestamp,
                });
                // Create buttons and axes. When done, start the update loop
                var that = this;
                utils.resolve_promises_dict({
                    buttons: Promise.all(pad.buttons.map(function(btn, index) {
                        return that._create_button_model(index);
                    })),
                    axes: Promise.all(pad.axes.map(function(axis, index) {
                        return that._create_axis_model(index);
                    })),
                }).then(function(controls) {
                    that.set(controls);
                    window.requestAnimationFrame(_.bind(that.update_loop, that));
                });
            } else {
                window.requestAnimationFrame(_.bind(this.wait_loop, this));
            }
        },

        update_loop: function() {
            /* Populates axes and button values, until the gamepad is disconnected.
             * When the gamepad is disconnection this.reset_gamepad is called.
             */ 
            var index = this.get('index');
            var pad = navigator.getGamepads()[index];
            if (pad && this.index === index) {
                this.set({
                    timestamp: pad.timestamp,
                    connected: pad.connected,
                });
                this.save_changes();
                _.each(this.get('buttons'), function(model, index) {
                    model.set({
                        value: pad.buttons[index].value,
                        pressed: pad.buttons[index].pressed,
                    });
                    model.save_changes();
                });
                _.each(this.get('axes'), function(model, index) {
                    model.set('value', pad.axes[index]);
                    model.save_changes();
                });
                window.requestAnimationFrame(_.bind(this.update_loop, this));
            } else {
                this.reset_gamepad();
            } 
        },

        reset_gamepad: function() {
            /* Resets the gamepad attributes, and calls the wait_loop.
             */
            _.each(this.get('buttons'), function(button) {
                button.close();
            });
            _.each(this.get('axes'), function(axis) {
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
            window.requestAnimationFrame(_.bind(this.wait_loop, this));
        },

        _create_button_model: function(index) {
            /* Creates a gamepad button widget.
             */
            return this.widget_manager.create_model({
                 model_name: 'WidgetModel', 
                 widget_class: 'gamepad.gamepad.Button',
            }).then(function(model) {
                 return model.request_state().then(function() {
                     model.index = index;
                     return model;
                 });
            });
        },

        _create_axis_model: function(index) {
            /* Creates a gamepad axis widget.
             */
            return this.widget_manager.create_model({
                 model_name: 'WidgetModel', 
                 widget_class: 'gamepad.gamepad.Axis',
            }).then(function(model) {
                 return model.request_state().then(function() {
                     model.index = index;
                     return model;
                 });
            });
        },
    }, { 
        serializers: _.extend({
            buttons: {deserialize: widget.unpack_models},
            axes: {deserialize: widget.unpack_models},
        }, widget.WidgetModel.serializers)
    });

    var GamepadView = widget.DOMWidgetView.extend({
        /* A simple view for a gamepad. */
        initialize: function() {
            GamepadView.__super__.initialize.apply(this, arguments);

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
            this.$box.addClass('widget-box vbox');
             
            this.$label = $('<div />')
                .appendTo(this.$box);

            this.$axis_box = $('<div />')
                .addClass('widget-box hbox')
                .appendTo(this.$box);

            this.$button_box = $('<div />')
                .addClass('widget-box hbox')
                .appendTo(this.$box);

            this.button_views.update(this.model.get('buttons'));
            this.axis_views.update(this.model.get('axes'));

            this.update_label();
        },

        update_label: function() {
            this.$label.text(this.model.get('name') ||
                             'Connect gamepad and press any button');
        }, 

        add_button: function(model) {
            var that = this;
            var dummy = $('<div/>');
            that.$button_box.append(dummy);
            return this.create_child_view(model).then(function(view) {
                dummy.replaceWith(view.el);
                that.after_displayed(function() {
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
                that.after_displayed(function() {
                    view.trigger('displayed');
                });
                return view;
            }).catch(utils.reject('Could not add axis view', true));
        },
 
        remove: function() {
            GamepadView.__super__.remove.apply(this, arguments);
            this.button_views.remove();
            this.axis_views.remove();
        },

    });

    return {
        Button: Button,
        Axis: Axis,
        Gamepad: Gamepad,
        GamepadView: GamepadView,
    };
});
