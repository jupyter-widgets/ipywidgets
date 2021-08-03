// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { assign } from './utils';

import { WidgetModel, WidgetView, DOMWidgetView } from './widget';

/**
 * Three functions to deal with some CSS attributes
 * to make them easier to use.
 */

export class StyleModel extends WidgetModel {
  defaults(): Backbone.ObjectHash {
    const Derived = this.constructor as typeof StyleModel;
    return assign(
      super.defaults(),
      {
        _model_name: 'StyleModel',
        _view_name: 'StyleView',
      },
      Object.keys(Derived.styleProperties).reduce((obj: any, key: string) => {
        obj[key] = Derived.styleProperties[key].default;
        return obj;
      }, {})
    );
  }

  public static styleProperties: { [s: string]: IStyleProperty } = {};
}

interface IStyleProperty {
  attribute: string;
  selector: string;
  default: string;
}

export class StyleView extends WidgetView {
  /**
   * Public constructor
   */
  initialize(parameters: WidgetView.IInitializeParameters): void {
    this._traitNames = [];
    super.initialize(parameters);
    // Register the traits that live on the Python side
    const ModelType = this.model.constructor as typeof StyleModel;
    for (const key of Object.keys(ModelType.styleProperties)) {
      this.registerTrait(key);
    }

    // Set the initial styles
    this.style();
  }

  /**
   * Register a CSS trait that is known by the model
   * @param trait
   */
  registerTrait(trait: string): void {
    this._traitNames.push(trait);

    // Listen to changes, and set the value on change.
    this.listenTo(
      this.model,
      'change:' + trait,
      (model: StyleModel, value: string) => {
        this.handleChange(trait, value);
      }
    );
  }

  /**
   * Handles when a trait value changes
   */
  handleChange(trait: string, value: any): void {
    // should be synchronous so that we can measure later.
    const parent = this.options.parent as DOMWidgetView;
    if (parent) {
      const ModelType = this.model.constructor as typeof StyleModel;
      const styleProperties = ModelType.styleProperties;
      const attribute = styleProperties[trait].attribute;
      const selector = styleProperties[trait].selector;
      const elements = selector
        ? parent.el.querySelectorAll<HTMLElement>(selector)
        : [parent.el];
      if (value === null) {
        for (let i = 0; i !== elements.length; ++i) {
          elements[i].style.removeProperty(attribute);
        }
      } else {
        for (let i = 0; i !== elements.length; ++i) {
          elements[i].style.setProperty(attribute, value);
        }
      }
    } else {
      console.warn('Style not applied because a parent view does not exist');
    }
  }

  /**
   * Apply styles for all registered traits
   */
  style(): void {
    for (const trait of this._traitNames) {
      this.handleChange(trait, this.model.get(trait));
    }
  }

  /**
   * Remove the styling from the parent view.
   */
  unstyle(): void {
    const parent = this.options.parent as DOMWidgetView;
    const ModelType = this.model.constructor as typeof StyleModel;
    const styleProperties = ModelType.styleProperties;
    this._traitNames.forEach((trait) => {
      if (parent) {
        const attribute = styleProperties[trait].attribute;
        const selector = styleProperties[trait].selector;
        const elements = selector
          ? parent.el.querySelectorAll<HTMLElement>(selector)
          : [parent.el];
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
