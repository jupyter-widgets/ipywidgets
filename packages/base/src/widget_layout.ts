// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    assign
} from './utils';

import {
    WidgetModel, WidgetView, DOMWidgetView
} from './widget';


/**
 * css properties exposed by the layout widget with their default values.
 */
let css_properties = {
    align_content: null,
    align_items: null,
    align_self: null,
    border: null,
    bottom: null,
    display: null,
    flex: null,
    flex_flow: null,
    height: null,
    justify_content: null,
    left: null,
    margin: null,
    max_height: null,
    max_width: null,
    min_height: null,
    min_width: null,
    overflow: null,
    overflow_x: null,
    overflow_y: null,
    order: null,
    padding: null,
    right: null,
    top: null,
    visibility: null,
    width: null
};

export
class LayoutModel extends WidgetModel {
    defaults() {
        return assign(super.defaults(), {
        _model_name: 'LayoutModel',
        _view_name: 'LayoutView'
        }, css_properties);
    }
}

export
class LayoutView extends WidgetView {
    /**
     * Public constructor
     */
    initialize(parameters) {
        this._traitNames = [];
        super.initialize(parameters);
        // Register the traits that live on the Python side
        for (let key of Object.keys(css_properties)) {
            this.registerTrait(key)
        }
    }

    /**
     * Register a CSS trait that is known by the model
     * @param trait
     */
    registerTrait(trait: string) {
        this._traitNames.push(trait);

        // Listen to changes, and set the value on change.
        this.listenTo(this.model, 'change:' + trait, (model, value) => {
            this.handleChange(trait, value);
        });

        // Set the initial value on display.
        this.handleChange(trait, this.model.get(trait));
    }

    /**
     * Get the the name of the css property from the trait name
     * @param  model attribute name
     * @return css property name
     */
    css_name(trait: string): string {
        return trait.replace('_', '-');
    }

    /**
     * Handles when a trait value changes
     */
    handleChange(trait: string, value: any) {
        // should be synchronous so that we can measure later.
        let parent = this.options.parent as DOMWidgetView;
        if (parent) {
            if (value === null) {
                parent.el.style.removeProperty(this.css_name(trait));
            } else {
                parent.el.style[this.css_name(trait)] = value;
            }
        } else {
            console.warn('Style not applied because a parent view does not exist');
        }
    }

    /**
     * Remove the styling from the parent view.
     */
    unlayout() {
        let parent = this.options.parent as DOMWidgetView;
        this._traitNames.forEach((trait) => {
            if (parent) {
                parent.el.style.removeProperty(this.css_name(trait));
            } else {
                console.warn('Style not removed because a parent view does not exist');
            }
        }, this);
    }

    private _traitNames: string[];
}
