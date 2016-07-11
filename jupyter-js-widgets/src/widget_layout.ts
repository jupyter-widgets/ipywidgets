// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView
} from './widget';
import * as _ from 'underscore';

/**
 * css properties exposed by the layout widget with their default values.
 */
let css_properties = {
    align_content: '',
    align_items: '',
    align_self: '',
    border: '',
    bottom: '',
    display: '',
    flex: '',
    flex_flow: '',
    height: '',
    justify_content: '',
    left: '',
    margin: '',
    max_height: '',
    max_width: '',
    min_height: '',
    min_width: '',
    overflow: '',
    overflow_x: '',
    overflow_y: '',
    order: '',
    padding: '',
    right: '',
    top: '',
    visibility: '',
    width: ''
};

/**
 * Represents a group of CSS style attributes
 */
export
class LayoutModel extends DOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
        _model_name: 'LayoutModel',
        _view_name: 'LayoutView'
        }, css_properties);
    }
}

export
class LayoutView extends DOMWidgetView {
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
        this.displayed.then(() => {
            this.handleChange(trait, this.model.get(trait));
        });
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
        this.displayed.then((parent) => {
            if (parent) {
                parent.el.style[this.css_name(trait)] = value;
            } else {
                console.warn('Style not applied because a parent view doesn\'t exist');
            }
        });
    }

    /**
     * Remove the styling from the parent view.
     */
    unlayout() {
        this._traitNames.forEach((trait) => {
            this.displayed.then((parent) => {
                if (parent) {
                    parent.el.style[this.css_name(trait)] = '';
                } else {
                    console.warn('Style not removed because a parent view doesn\'t exist');
                }
            });
        }, this);
    }

    private _traitNames: string[];
}
