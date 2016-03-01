// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var $ = require('jquery');

/**
 * WidgetArea
 */
var WidgetArea = function(cell) {
    this.widget_views = [];

    this._cell = cell;
    this._widgets_live = true;
    this.disposed = false;

    this._create_elements();
    this._bind_events();
    requirejs(['base/js/events'], (function(events) {
        events.trigger('create.WidgetArea', {widgetarea: this, cell: cell});
    }).bind(this));

    var that = this;
    var died = function () { that._widget_dead(); };
    cell.notebook.events.on('kernel_disconnected.Kernel', died);
    cell.notebook.events.on('kernel_killed.Kernel', died);
    cell.notebook.events.on('kernel_restarting.Kernel', died);
    cell.notebook.events.on('kernel_dead.Kernel', died);
};

/**
*  Display a widget view in the cell.
*/
WidgetArea.prototype.display_widget_view = function(view_promise) {

    // Display a dummy element
    var dummy = $('<div/>');
    this.widget_subarea.append(dummy);

    // Display the view.
    var that = this;
    return view_promise.then(function(view) {
        that.widget_area.show();
        dummy.replaceWith(view.el);
        that.widget_views.push(view);

        // Check the live state of the view's model.
        if (view.model.comm_live) {
            that._widget_live(view);
        } else {
            that._widget_dead(view);
        }

        // If the view is removed, check to see if the widget area is empty.
        // If the widget area is empty, close it.
        view.on('remove', function() {
            var index = that.widget_views.indexOf(view);
            if (index !== -1) that.widget_views.splice(index, 1);

            if (that.widget_views.length === 0) {
                that._clear();
            }
        });

        return view;
    });
};

/**
 * Disposes of the widget area and its widgets.
 */
WidgetArea.prototype.dispose = function() {
    this._cell.notebook.events.off('kernel_disconnected.Kernel');
    this._cell.notebook.events.off('kernel_killed.Kernel');
    this._cell.notebook.events.off('kernel_restarting.Kernel');
    this._cell.notebook.events.off('kernel_dead.Kernel');
    this._clear();
    this.disposed = true;
};

/**
 * Creates the elements of the widget area and appends them
 * to the associated cell.
 */
WidgetArea.prototype._create_elements = function() {
    var widget_area = $('<div/>')
        .addClass('widget-area')
        .hide();
    this.widget_area = widget_area;
    var widget_prompt = $('<div/>')
        .addClass('prompt')
        .appendTo(widget_area);
    var widget_subarea = $('<div/>')
        .addClass('widget-subarea')
        .appendTo(widget_area);
    this.widget_subarea = widget_subarea;
    var that = this;
    var widget_clear_buton = $('<button />')
        .addClass('close')
        .html('&times;')
        .click(function() {
            widget_area.slideUp('', function(){
                for (var i = 0; i < that.widget_views.length; i++) {
                    var view = that.widget_views[i];
                    view.remove();
                }
                that.widget_views = [];
                widget_subarea.html('');
            });
        })
        .appendTo(widget_prompt);

    if (this._cell.input) {
        this._cell.input.after(widget_area);
    } else {
        throw new Error('Cell does not have an `input` element.  Is it not a CodeCell?');
    }
};

/**
 * Listens to events of the cell.
 */
WidgetArea.prototype._bind_events = function() {
    requirejs(['base/js/events'], (function(events) {
        events.on('execute.CodeCell', (function(event, data) {
            if (data.cell===this._cell) {
                this._clear();
            }
        }).bind(this));
    }).bind(this));
};

/**
 * Handles when a widget loses it's comm connection.
 * @param {WidgetView} view
 */
WidgetArea.prototype._widget_dead = function() {
    if (this._widgets_live) {
        this._widgets_live = false;
        this.widget_area.addClass('connection-problems');
    }

};

/**
 * Handles when a widget is connected to a live comm.
 */
WidgetArea.prototype._widget_live = function() {
    if (!this._widgets_live) {
        // Check that the other widgets are live too.  O(N) operation.
        // Abort the function at the first dead widget found.
        for (var i = 0; i < this.widget_views.length; i++) {
            if (!this.widget_views[i].model.comm_live) {
                return;
            }
        }
        this._widgets_live = true;
        this.widget_area.removeClass('connection-problems');
    }
};

/**
 * Clears the widgets in the widget area.
 */
WidgetArea.prototype._clear = function() {
    // Clear widget area
    for (var i = 0; i < this.widget_views.length; i++) {
        var view = this.widget_views[i];
        view.remove();
    }
    this.widget_views = [];
    this.widget_subarea.html('');
    this.widget_subarea.height('');
    this.widget_area.height('');
    this.widget_area.hide();
};

module.exports = {
    WidgetArea: WidgetArea
};
