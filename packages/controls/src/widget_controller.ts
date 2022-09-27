// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDOMWidgetModel } from './widget_core';

import {
  DOMWidgetView,
  unpack_models,
  ViewList,
  JupyterLuminoPanelWidget,
  reject,
  WidgetView,
  Dict,
} from '@jupyter-widgets/base';

import { Widget, Panel } from '@lumino/widgets';

import { ArrayExt } from '@lumino/algorithm';

import * as utils from './utils';
import $ from 'jquery';

export class ControllerButtonModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ControllerButtonModel',
      _view_name: 'ControllerButtonView',
      value: 0.0,
      pressed: false,
    };
  }
}

/**
 * Very simple view for a gamepad button.
 */
export class ControllerButtonView extends DOMWidgetView {
  render(): void {
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-controller-button');
    this.el.style.width = 'fit-content';

    this.support = document.createElement('div');
    this.support.style.position = 'relative';
    this.support.style.margin = '1px';
    this.support.style.width = '16px';
    this.support.style.height = '16px';
    this.support.style.border = '1px solid black';
    this.support.style.background = 'lightgray';
    this.el.appendChild(this.support);

    this.bar = document.createElement('div');
    this.bar.style.position = 'absolute';
    this.bar.style.width = '100%';
    this.bar.style.bottom = '0px';
    this.bar.style.background = 'gray';
    this.support.appendChild(this.bar);

    this.update();
    this.label = document.createElement('div');
    this.label.textContent = this.model.get('description');
    this.label.style.textAlign = 'center';
    this.el.appendChild(this.label);
  }

  update(): void {
    this.bar.style.height = 100 * this.model.get('value') + '%';
  }

  support: HTMLDivElement;
  bar: HTMLDivElement;
  label: HTMLDivElement;
}

export class ControllerAxisModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ControllerAxisModel',
      _view_name: 'ControllerAxisView',
      value: 0.0,
    };
  }
}

/**
 * Very simple view for a gamepad axis.
 */
export class ControllerAxisView extends DOMWidgetView {
  render(): void {
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-controller-axis');
    this.el.style.width = '16px';
    this.el.style.padding = '4px';

    this.support = document.createElement('div');
    this.support.style.position = 'relative';
    this.support.style.margin = '1px';
    this.support.style.width = '4px';
    this.support.style.height = '64px';
    this.support.style.border = '1px solid black';
    this.support.style.background = 'lightgray';

    this.bullet = document.createElement('div');
    this.bullet.style.position = 'absolute';
    this.bullet.style.margin = '-3px';
    this.bullet.style.boxSizing = 'unset';
    this.bullet.style.width = '10px';
    this.bullet.style.height = '10px';
    this.bullet.style.background = 'gray';

    this.label = document.createElement('div');
    this.label.textContent = this.model.get('description');
    this.label.style.textAlign = 'center';

    this.support.appendChild(this.bullet);
    this.el.appendChild(this.support);
    this.el.appendChild(this.label);

    this.update();
  }

  update(): void {
    this.bullet.style.top = 50 * (this.model.get('value') + 1) + '%';
  }

  support: HTMLDivElement;
  bullet: HTMLDivElement;
  label: HTMLDivElement;
}

export class ControllerModel extends CoreDOMWidgetModel {
  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    buttons: { deserialize: unpack_models },
    axes: { deserialize: unpack_models },
  };

  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ControllerModel',
      _view_name: 'ControllerView',
      index: 0,
      name: '',
      mapping: '',
      connected: false,
      timestamp: 0,
      buttons: [],
      axes: [],
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: any): void {
    super.initialize(attributes, options);
    if (navigator.getGamepads === void 0) {
      // Checks if the browser supports the gamepad API
      this.readout = 'This browser does not support gamepads.';
      console.error(this.readout);
    } else {
      // Start the wait loop, and listen to updates of the only
      // user-provided attribute, the gamepad index.
      this.readout = 'Connect gamepad and press any button.';
      if (this.get('connected')) {
        // No need to re-create Button and Axis widgets, re-use
        // the models provided by the backend which may already
        // be wired to other things.
        this.update_loop();
      } else {
        // Wait for a gamepad to be connected.
        this.wait_loop();
      }
    }
  }

  /**
   * Waits for a gamepad to be connected at the provided index.
   * Once one is connected, it will start the update loop, which
   * populates the update of axes and button values.
   */
  wait_loop(): void {
    const index = this.get('index');
    const pad = navigator.getGamepads()[index];
    if (pad) {
      this.setup(pad).then((controls) => {
        this.set(controls);
        this.save_changes();
        window.requestAnimationFrame(this.update_loop.bind(this));
      });
    } else {
      window.requestAnimationFrame(this.wait_loop.bind(this));
    }
  }

  /**
   * Given a native gamepad object, returns a promise for a dictionary of
   * controls, of the form
   * {
   *     buttons: list of Button models,
   *     axes: list of Axis models,
   * }
   */
  setup(pad: Gamepad): Promise<Dict<ControllerButtonModel[]>> {
    // Set up the main gamepad attributes
    this.set({
      name: pad.id,
      mapping: pad.mapping,
      connected: pad.connected,
      timestamp: pad.timestamp,
    });
    // Create buttons and axes. When done, start the update loop
    return utils.resolvePromisesDict({
      buttons: Promise.all(
        pad.buttons.map((btn, index) => {
          return this._create_button_model(index);
        })
      ),
      axes: Promise.all(
        pad.axes.map((axis, index) => {
          return this._create_axis_model(index);
        })
      ),
    });
  }

  /**
   * Update axes and buttons values, until the gamepad is disconnected.
   * When the gamepad is disconnected, this.reset_gamepad is called.
   */
  update_loop(): void {
    const index = this.get('index');
    const id = this.get('name');
    const pad = navigator.getGamepads()[index];
    if (pad && index === pad.index && id === pad.id) {
      this.set({
        timestamp: pad.timestamp,
        connected: pad.connected,
      });
      this.save_changes();
      this.get('buttons').forEach(function (
        model: ControllerButtonModel,
        index: number
      ) {
        model.set({
          value: pad!.buttons[index].value,
          pressed: pad!.buttons[index].pressed,
        });
        model.save_changes();
      });
      this.get('axes').forEach(function (
        model: ControllerAxisModel,
        index: number
      ) {
        model.set('value', pad!.axes[index]);
        model.save_changes();
      });
      window.requestAnimationFrame(this.update_loop.bind(this));
    } else {
      this.reset_gamepad();
    }
  }

  /**
   * Resets the gamepad attributes, and start the wait_loop.
   */
  reset_gamepad(): void {
    this.get('buttons').forEach(function (button: ControllerButtonModel) {
      button.close();
    });
    this.get('axes').forEach(function (axis: ControllerAxisModel) {
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
    window.requestAnimationFrame(this.wait_loop.bind(this));
  }

  /**
   * Creates a gamepad button widget.
   */
  _create_button_model(index: number): Promise<ControllerButtonModel> {
    return this.widget_manager
      .new_widget({
        model_name: 'ControllerButtonModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: this.get('_model_module_version'),
        view_name: 'ControllerButtonView',
        view_module: '@jupyter-widgets/controls',
        view_module_version: this.get('_view_module_version'),
      })
      .then(function (model) {
        model.set('description', index);
        return model;
      });
  }

  /**
   * Creates a gamepad axis widget.
   */
  _create_axis_model(index: number): Promise<ControllerAxisModel> {
    return this.widget_manager
      .new_widget({
        model_name: 'ControllerAxisModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: this.get('_model_module_version'),
        view_name: 'ControllerAxisView',
        view_module: '@jupyter-widgets/controls',
        view_module_version: this.get('_view_module_version'),
      })
      .then(function (model) {
        model.set('description', index);
        return model;
      });
  }

  readout: string;
}

/**
 * A simple view for a gamepad.
 */
export class ControllerView extends DOMWidgetView {
  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoPanelWidget({ view: this });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }

    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);

    this.button_views = new ViewList(this.add_button, null, this);
    this.listenTo(this.model, 'change:buttons', (model, value) => {
      this.button_views.update(value);
    });

    this.axis_views = new ViewList(this.add_axis, null, this);
    this.listenTo(this.model, 'change:axes', (model, value) => {
      this.axis_views.update(value);
    });

    this.listenTo(this.model, 'change:name', this.update_label);
  }

  render(): void {
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-controller');
    this.label = document.createElement('div');
    this.el.appendChild(this.label);

    this.axis_box = new Panel();
    this.axis_box.node.style.display = 'flex';
    this.luminoWidget.addWidget(this.axis_box);

    this.button_box = new Panel();
    this.button_box.node.style.display = 'flex';
    this.luminoWidget.addWidget(this.button_box);

    this.button_views.update(this.model.get('buttons'));
    this.axis_views.update(this.model.get('axes'));

    this.update_label();
  }

  update_label(): void {
    this.label.textContent = this.model.get('name') || this.model.readout;
  }

  add_button(model: ControllerButtonModel): Promise<ControllerButtonView> {
    // we insert a dummy element so the order is preserved when we add
    // the rendered content later.
    const dummy = new Widget();
    this.button_box.addWidget(dummy);

    return this.create_child_view<ControllerButtonView>(model)
      .then((view) => {
        // replace the dummy widget with the new one.
        const i = ArrayExt.firstIndexOf(this.button_box.widgets, dummy);
        this.button_box.insertWidget(i, view.luminoWidget);
        dummy.dispose();
        return view;
      })
      .catch(reject('Could not add child button view to controller', true));
  }

  add_axis(model: ControllerAxisModel): Promise<ControllerAxisView> {
    // we insert a dummy element so the order is preserved when we add
    // the rendered content later.
    const dummy = new Widget();
    this.axis_box.addWidget(dummy);

    return this.create_child_view<ControllerAxisView>(model)
      .then((view) => {
        // replace the dummy widget with the new one.
        const i = ArrayExt.firstIndexOf(this.axis_box.widgets, dummy);
        this.axis_box.insertWidget(i, view.luminoWidget);
        dummy.dispose();
        return view;
      })
      .catch(reject('Could not add child axis view to controller', true));
  }

  remove(): void {
    super.remove();
    this.button_views.remove();
    this.axis_views.remove();
  }

  button_views: ViewList<ControllerButtonView>;
  axis_views: ViewList<ControllerAxisView>;
  label: HTMLDivElement;
  axis_box: Panel;
  button_box: Panel;
  model: ControllerModel;
  luminoWidget: JupyterLuminoPanelWidget;
}
