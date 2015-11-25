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
    var StyleView = widget.WidgetView.extend({
        
        /**
         * Public constructor
         */
        constructor: function() {
            StyleView.__super__.constructor.apply(this, arguments);
            
            // Register the traits that live on the Python side
            this._traitNames = [];
            this.initTraits();
        },
        
        /**
         * Initialize the traits for this Style object
         */
        initTraits: function() {
            this.registerTraits(
                'additive-symbols', 'align-content', 'align-items', 'align-self', 
                'all', 'animation', 'animation-delay', 'animation-direction', 
                'animation-duration', 'animation-fill-mode', 
                'animation-iteration-count', 'animation-name', 
                'animation-play-state', 'animation-timing-function', 
                'backface-visibility', 'background', 'background-attachment', 
                'background-blend-mode', 'background-clip', 'background-color', 
                'background-image', 'background-origin', 'background-position', 
                'background-repeat', 'background-size', 'border', 'border-bottom', 
                'border-bottom-color', 'border-bottom-left-radius', 
                'border-bottom-right-radius', 'border-bottom-style', 
                'border-bottom-width', 'border-collapse', 'border-color', 
                'border-image', 'border-image-outset', 'border-image-repeat', 
                'border-image-slice', 'border-image-source', 
                'border-image-width', 'border-left', 'border-left-color', 
                'border-left-style', 'border-left-width', 'border-radius', 
                'border-right', 'border-right-color', 'border-right-style', 
                'border-right-width', 'border-spacing', 'border-style', 
                'border-top', 'border-top-color', 'border-top-left-radius', 
                'border-top-right-radius', 'border-top-style', 
                'border-top-width', 'border-width', 'bottom', 'box-shadow', 
                'box-sizing', 'break-after', 'break-before', 'break-inside', 
                'clear', 'color', 'columns', 'column-count', 'column-fill', 
                'column-gap', 'column-rule', 'column-rule-color', 
                'column-rule-style', 'column-rule-width', 'column-span', 
                'column-width', 'content', 'counter-increment', 'counter-reset', 
                'cursor', 'direction', 'display', 'empty-cells', 'flex', 
                'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 
                'flex-shrink', 'flex-wrap', 'float', 'font', 'font-family', 
                'font-feature-settings', 'font-kerning', 'font-language-override', 
                'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 
                'font-synthesis', 'font-variant', 'font-variant-alternates', 
                'font-variant-caps', 'font-variant-east-asian', 
                'font-variant-ligatures', 'font-variant-numeric', 
                'font-variant-position', 'font-weight', 'height', 
                'image-rendering', 'isolation', 'justify-content', 'left', 
                'letter-spacing', 'line-height', 'list-style', 'list-style-image', 
                'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 
                'margin-inline-end', 'margin-inline-start', 'margin-left', 
                'margin-right', 'margin-top', 'max-height', 'max-width', 
                'min-height', 'min-width', 'mix-blend-mode', 'object-fit', 
                'object-position', 'offset-inline-end', 'offset-inline-start', 
                'opacity', 'order', 'orientation', 'outline', 'outline-color', 
                'outline-offset', 'outline-style', 'outline-width', 'overflow', 
                'overflow-wrap', 'overflow-x', 'overflow-y', 'padding', 
                'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 
                'page-break-after', 'page-break-before', 'page-break-inside', 
                'perspective', 'perspective-origin', 'pointer-events', 'position', 
                'quotes', 'resize', 'right', 'scroll-behavior', 'table-layout', 
                'tab-size', 'text-align', 'text-align-last', 'text-decoration', 
                'text-indent', 'text-orientation', 'text-overflow', 'text-rendering', 
                'text-shadow', 'text-transform', 'top', 'transform', 'transform-box', 
                'transform-origin', 'transform-style', 'transition', 
                'transition-delay', 'transition-duration', 'transition-property', 
                'transition-timing-function', 'unicode-bidi', 'unicode-range', 
                'vertical-align', 'visibility', 'white-space', 'width', 
                'will-change', 'word-break', 'word-spacing', 'word-wrap', 
                'writing-mode', 'z-index'
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
        unstyle: function() {
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
    
    return {StyleView: StyleView};
});
