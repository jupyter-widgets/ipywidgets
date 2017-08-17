// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    assign
} from './utils';

import {
    WidgetModel, WidgetView, DOMWidgetView
} from './widget';


export
class StyleModel extends WidgetModel {
    defaults() {
        let Derived = this.constructor as typeof StyleModel;
        return assign(super.defaults(), {
            _model_name: 'StyleModel',
            _view_name: 'StyleView',
        }, Object.keys(Derived.styleProperties).reduce((obj: any, key: string) => {
            obj[key] = Derived.styleProperties[key].default;
            return obj;
        }, {}));
    }

    public static styleProperties = {};
}

export
class StyleView extends WidgetView {

    /**
     * Public constructor
     */
    initialize(parameters) {
        this._traitNames = [];
        super.initialize(parameters);
        // Register the traits that live on the Python side
        let ModelType = this.model.constructor as typeof StyleModel;
        for (let key of Object.keys(ModelType.styleProperties)) {
            this.registerTrait(key)
        }

        // Set the initial styles
        this.style();
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
    }

    /**
     * Handles when a trait value changes
     */
    handleChange(trait: string, value: any) {
        // should be synchronous so that we can measure later.
        let parent = this.options.parent as DOMWidgetView;
        if (parent) {
            let ModelType = this.model.constructor as typeof StyleModel;
            let styleProperties = ModelType.styleProperties;
            let attribute = styleProperties[trait].attribute;
            let selector  = styleProperties[trait].selector;
            let elements = selector ? parent.el.querySelectorAll(selector) : [ parent.el ];
            if (value === null) {
                for (let i = 0; i !== elements.length; ++i) {
                    elements[i].style.removeProperty(attribute);
                }
            } else {
                for (let i = 0; i !== elements.length; ++i) {
                    elements[i].style[attribute] = value;
                }
            }
        } else {
            console.warn('Style not applied because a parent view does not exist');
        }
    }

    /**
     * Apply styles for all registered traits
     */
    style() {
        for (let trait of this._traitNames) {
            this.handleChange(trait, this.model.get(trait));
        }
     }

    /**
     * Remove the styling from the parent view.
     */
    unstyle() {
        let parent = this.options.parent as DOMWidgetView;
        let ModelType = this.model.constructor as typeof StyleModel;
        let styleProperties = ModelType.styleProperties;
        this._traitNames.forEach((trait) => {
            if (parent) {
                let attribute = styleProperties[trait].attribute;
                let selector  = styleProperties[trait].selector;
                let elements = selector ? parent.el.querySelectorAll(selector) : [ parent.el ];
                for (let i = 0; i !== elements.length; ++i) {
                    elements[i].style.removeProperty(attribute);
                }
            } else {
                console.warn('Style not removed because a parent view does not exist');
            }
        }, this);
    }

    private _traitNames: string[];
}

