// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { assign, Dict } from './utils';

import { WidgetModel, WidgetView, DOMWidgetView } from './widget';

/**
 * css properties exposed by the layout widget with their default values.
 */
const css_properties: Dict<string | null> = {
  align_content: null,
  align_items: null,
  align_self: null,
  border_top: null,
  border_right: null,
  border_bottom: null,
  border_left: null,
  bottom: null,
  display: null,
  flex: null,
  flex_flow: null,
  height: null,
  justify_content: null,
  justify_items: null,
  left: null,
  margin: null,
  max_height: null,
  max_width: null,
  min_height: null,
  min_width: null,
  overflow: null,
  order: null,
  padding: null,
  right: null,
  top: null,
  visibility: null,
  width: null,

  // image-specific
  object_fit: null,
  object_position: null,

  // container
  grid_auto_columns: null,
  grid_auto_flow: null,
  grid_auto_rows: null,
  grid_gap: null,
  grid_template_rows: null,
  grid_template_columns: null,
  grid_template_areas: null,

  // items
  grid_row: null,
  grid_column: null,
  grid_area: null,
};

export class LayoutModel extends WidgetModel {
  defaults(): Backbone.ObjectHash {
    return assign(
      super.defaults(),
      {
        _model_name: 'LayoutModel',
        _view_name: 'LayoutView',
      },
      css_properties
    );
  }
}

export class LayoutView extends WidgetView {
  /**
   * Public constructor
   */
  initialize(parameters: WidgetView.IInitializeParameters): void {
    this._traitNames = [];
    super.initialize(parameters);
    // Register the traits that live on the Python side
    for (const key of Object.keys(css_properties)) {
      this.registerTrait(key);
    }
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
      (model: LayoutModel, value: any) => {
        this.handleChange(trait, value);
      }
    );

    // Set the initial value on display.
    this.handleChange(trait, this.model.get(trait));
  }

  /**
   * Get the the name of the css property from the trait name
   * @param  model attribute name
   * @return css property name
   */
  css_name(trait: string): string {
    return trait.replace(/_/g, '-');
  }

  /**
   * Handles when a trait value changes
   */
  handleChange(trait: string, value: any): void {
    // should be synchronous so that we can measure later.
    const parent = this.options.parent as DOMWidgetView;
    if (parent) {
      if (value === null) {
        parent.el.style.removeProperty(this.css_name(trait));
      } else {
        parent.el.style.setProperty(this.css_name(trait), value);
      }
    } else {
      console.warn('Style not applied because a parent view does not exist');
    }
  }

  /**
   * Remove the styling from the parent view.
   */
  unlayout(): void {
    const parent = this.options.parent as DOMWidgetView;
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
