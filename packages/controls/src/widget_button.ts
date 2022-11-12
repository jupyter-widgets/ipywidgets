// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetView, StyleModel } from '@jupyter-widgets/base';

import { CoreDOMWidgetModel } from './widget_core';

import { JUPYTER_CONTROLS_VERSION } from './version';

export class ButtonStyleModel extends StyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ButtonStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    button_color: {
      selector: '',
      attribute: 'background-color',
      default: null as any,
    },
    font_family: {
      selector: '',
      attribute: 'font-family',
      default: '',
    },
    font_size: {
      selector: '',
      attribute: 'font-size',
      default: '',
    },
    font_style: {
      selector: '',
      attribute: 'font-style',
      default: '',
    },
    font_variant: {
      selector: '',
      attribute: 'font-variant',
      default: '',
    },
    font_weight: {
      selector: '',
      attribute: 'font-weight',
      default: '',
    },
    text_color: {
      selector: '',
      attribute: 'color',
      default: '',
    },
    text_decoration: {
      selector: '',
      attribute: 'text-decoration',
      default: '',
    },
  };
}

export class ButtonModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      description: '',
      tooltip: '',
      disabled: false,
      icon: '',
      button_style: '',
      _view_name: 'ButtonView',
      _model_name: 'ButtonModel',
      style: null,
    };
  }
}

export class ButtonView extends DOMWidgetView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('jupyter-button');
    this.el.classList.add('widget-button');
    this.listenTo(this.model, 'change:button_style', this.update_button_style);
    this.listenTo(this.model, 'change:tabbable', this.updateTabindex);
    this.set_button_style();
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    this.el.disabled = this.model.get('disabled');
    this.updateTabindex();

    const tooltip = this.model.get('tooltip');
    const description = this.model.get('description');
    const icon = this.model.get('icon');

    this.el.setAttribute('title', tooltip ?? description);

    if (description.length || icon.length) {
      this.el.textContent = '';
      if (icon.length) {
        const i = document.createElement('i');
        i.classList.add('fa');
        i.classList.add(
          ...icon
            .split(/[\s]+/)
            .filter(Boolean)
            .map((v: string) => `fa-${v}`)
        );
        if (description.length === 0) {
          i.classList.add('center');
        }
        this.el.appendChild(i);
      }
      this.el.appendChild(document.createTextNode(description));
    }
    return super.update();
  }

  update_button_style(): void {
    this.update_mapped_classes(ButtonView.class_map, 'button_style');
  }

  set_button_style(): void {
    this.set_mapped_classes(ButtonView.class_map, 'button_style');
  }

  /**
   * Dictionary of events and handlers
   */
  events(): { [e: string]: string } {
    // TODO: return typing not needed in Typescript later than 1.8.x
    // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
    return { click: '_handle_click' };
  }

  /**
   * Handles when the button is clicked.
   */
  _handle_click(event: MouseEvent): void {
    event.preventDefault();
    this.send({ event: 'click' });
  }

  preinitialize() {
    // Must set this before the initialize method creates the element
    this.tagName = 'button';
  }

  el: HTMLButtonElement;

  static class_map = {
    primary: ['mod-primary'],
    success: ['mod-success'],
    info: ['mod-info'],
    warning: ['mod-warning'],
    danger: ['mod-danger'],
  };
}
