// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// npm compatibility
if (typeof define !== 'function') { var define = require('./requirejs-shim')(module); }

// Use the CommonJS-like requirejs style.
define([
    "./widget",
    "underscore",
    "backbone",
    "jquery"
], function(widget, _, Backbone, $) {
    
    /**
     * Represents a group of CSS style attributes
     */
    var LayoutView = widget.WidgetView.extend({
        
        /**
         * Public constructor
         */
        constructor: function() {
            LayoutView.__super__.constructor.apply(this, arguments);
            
            // Register the traits that live on the Python side
            this._traitNames = [];
            this.initTraits();
        },
        
        /**
         * Initialize the traits for this layout object
         */
        initTraits: function() {
            this.registerTraits(
                'align_content',
                'align_items',
                'align_self',
                'bottom',
                'display',
                'flex',
                'flex_basis',
                'flex_direction',
                'flex_flow',
                'flex_grow',
                'flex_shrink',
                'flex_wrap',
                'height',
                'justify_content',
                'left',
                'margin',
                'padding',
                'right',
                'top',
                'visibility',
                'width'
            );
        },
        
        /**
         * Register CSS traits that are known by the model
         * @param  {...string[]} traits
         */
        registerTraits: function() {

            // Expand any args that are arrays
            _.flatten(Array.prototype.slice.call(arguments))

                // Call registerTrait on each trait
                .forEach(_.bind(this.registerTrait, this));
        },
        
        /**
         * Register a CSS trait that is known by the model
         * @param  {string} trait
         */
        registerTrait: function(trait) {
            this._traitNames.push(trait);
            
            // Listen to changes, and set the value on change.
            this.listenTo(this.model, 'change:' + this.modelize(trait), function (model, value) { 
                this.handleChange(trait, value);
            }, this);

            // Set the initial value on display.
            this.displayed.then(_.bind(function() {
                this.handleChange(trait, this.model.get(this.modelize(trait)));
            }, this));
        },
        
        /**
         * Get the the name of the trait as it appears in the model
         * @param  {string} trait - CSS trait name
         * @return {string} model key name
         */
        modelize: function(trait) {
            return trait.replace('-', '_');
        },
        
        /**
         * Handles when a trait value changes
         * @param  {string} trait
         * @param  {object} value
         */
        handleChange: function(trait, value) {
            this.displayed.then(_.bind(function(parent) {
                if (parent) {
                    parent.el.style[trait] = value;
                } else {
                    console.warn("Style not applied because a parent view doesn't exist");
                }
            }, this));
        },
        
        /**
         * Remove the styling from the parent view.
         */
        unlayout: function() {
            this._traitNames.forEach(function(trait) {
                this.displayed.then(_.bind(function(parent) {
                    if (parent) {
                        parent.el.style[trait] = '';
                    } else {
                        console.warn("Style not removed because a parent view doesn't exist");
                    }
                }, this));
            }, this);
        }
    });
    
    return {LayoutView: LayoutView};
});
