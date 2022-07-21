// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetView,
  ViewList,
  JupyterLuminoWidget,
  WidgetModel,
  reject,
  WidgetView,
} from '@jupyter-widgets/base';

import { BoxModel, BoxView } from './widget_box';

import { TabBar } from '@lumino/widgets';

import { TabPanel } from './lumino/tabpanel';

import { Accordion } from './lumino/accordion';

import { Widget } from '@lumino/widgets';

import { each, ArrayExt } from '@lumino/algorithm';

import { Message, MessageLoop } from '@lumino/messaging';

import $ from 'jquery';

export class SelectionContainerModel extends BoxModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectionContainerModel',
      selected_index: null,
      titles: [],
    };
  }
}

export class AccordionModel extends SelectionContainerModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'AccordionModel',
      _view_name: 'AccordionView',
    };
  }
}

// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.

export class JupyterLuminoAccordionWidget extends Accordion {
  constructor(options: JupyterLuminoWidget.IOptions & Accordion.IOptions) {
    const view = options.view;
    delete (options as any).view;
    super(options);
    this._view = view;
  }

  /**
   * Process the Lumino message.
   *
   * Any custom Lumino widget used inside a Jupyter widget should override
   * the processMessage function like this.
   */
  processMessage(msg: Message): void {
    super.processMessage(msg);
    this._view?.processLuminoMessage(msg);
  }

  /**
   * Dispose the widget.
   *
   * This causes the view to be destroyed as well with 'remove'
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._view.remove();
    this._view = null!;
  }

  private _view: DOMWidgetView;
}

export class AccordionView extends DOMWidgetView {
  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoAccordionWidget({ view: this });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // Accordions don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }

    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.children_views = new ViewList(
      this.add_child_view,
      this.remove_child_view,
      this
    );
    this.listenTo(this.model, 'change:children', () => this.updateChildren());
    this.listenTo(this.model, 'change:selected_index', () =>
      this.update_selected_index()
    );
    this.listenTo(this.model, 'change:titles', () => this.update_titles());
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    const accordion = this.luminoWidget;
    accordion.addClass('jupyter-widgets');
    accordion.addClass('widget-accordion');
    accordion.addClass('widget-container');
    accordion.selection.selectionChanged.connect((sender) => {
      if (!this.updatingChildren) {
        this.model.set('selected_index', accordion.selection.index);
        this.touch();
      }
    });

    this.children_views?.update(this.model.get('children'));
    this.update_titles();
    this.update_selected_index();
  }

  /**
   * Update children
   */
  updateChildren(): void {
    // While we are updating, the index may not be valid, so deselect the
    // tabs before updating so we don't get spurious changes in the index,
    // which would then set off another sync cycle.
    this.updatingChildren = true;
    this.luminoWidget.selection.index = null;
    this.children_views?.update(this.model.get('children'));
    this.update_selected_index();
    this.updatingChildren = false;
  }

  /**
   * Set header titles
   */
  update_titles(): void {
    const collapsed = this.luminoWidget.collapseWidgets;
    const titles = this.model.get('titles');
    for (let i = 0; i < collapsed.length; i++) {
      if (titles[i] !== void 0) {
        collapsed[i].widget.title.label = titles[i];
      }
    }
  }

  /**
   * Make the rendering and selected index consistent.
   */
  update_selected_index(): void {
    this.luminoWidget.selection.index = this.model.get('selected_index');
  }

  /**
   * Called when a child is removed from children list.
   */
  remove_child_view(view: DOMWidgetView): void {
    this.luminoWidget.removeWidget(view.luminoWidget);
    view.remove();
  }

  /**
   * Called when a child is added to children list.
   */
  add_child_view(model: WidgetModel, index: number): Promise<DOMWidgetView> {
    // Placeholder widget to keep our position in the tab panel while we create the view.
    const accordion = this.luminoWidget;
    const placeholder = new Widget();
    placeholder.title.label = this.model.get('titles')[index] || '';
    accordion.addWidget(placeholder);
    return this.create_child_view(model)
      .then((view: DOMWidgetView) => {
        const widget = view.luminoWidget;
        widget.title.label = placeholder.title.label;
        const collapse =
          accordion.collapseWidgets[accordion.indexOf(placeholder)];
        collapse.widget = widget;
        placeholder.dispose();
        return view;
      })
      .catch(reject('Could not add child view to box', true));
  }

  remove(): void {
    this.children_views = null;
    super.remove();
  }

  children_views: ViewList<DOMWidgetView> | null;
  luminoWidget: Accordion;
  updatingChildren: boolean;
}

export class TabModel extends SelectionContainerModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'TabModel',
      _view_name: 'TabView',
    };
  }
}

// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.

export class JupyterLuminoTabPanelWidget extends TabPanel {
  constructor(options: JupyterLuminoWidget.IOptions & TabPanel.IOptions) {
    const view = options.view;
    delete (options as any).view;
    super(options);
    this._view = view;
    // We want the view's messages to be the messages the tabContents panel
    // gets.
    MessageLoop.installMessageHook(this.tabContents, (handler, msg) => {
      // There may be times when we want the view's handler to be called
      // *after* the message has been processed by the widget, in which
      // case we'll need to revisit using a message hook.
      this._view.processLuminoMessage(msg);
      return true;
    });
  }

  /**
   * Dispose the widget.
   *
   * This causes the view to be destroyed as well with 'remove'
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._view.remove();
    this._view = null!;
  }

  private _view: DOMWidgetView;
}

export class TabView extends DOMWidgetView {
  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoTabPanelWidget({
      view: this,
    });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // TabViews don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }

    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  /**
   * Public constructor.
   */
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.childrenViews = new ViewList(
      this.addChildView,
      (view) => {
        view.remove();
      },
      this
    );
    this.listenTo(this.model, 'change:children', () => this.updateTabs());
    this.listenTo(this.model, 'change:titles', () => this.updateTitles());
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    const tabs = this.luminoWidget;
    tabs.addClass('jupyter-widgets');
    tabs.addClass('widget-container');
    tabs.addClass('widget-tab');
    tabs.tabsMovable = true;
    tabs.tabBar.insertBehavior = 'none'; // needed for insert behavior, see below.
    tabs.tabBar.currentChanged.connect(this._onTabChanged, this);
    tabs.tabBar.tabMoved.connect(this._onTabMoved, this);

    tabs.tabBar.addClass('widget-tab-bar');
    tabs.tabContents.addClass('widget-tab-contents');

    // TODO: expose this option in python
    tabs.tabBar.tabsMovable = false;

    this.updateTabs();
    this.update();
  }

  /**
   * Render tab views based on the current model's children.
   */
  updateTabs(): void {
    // While we are updating, the index may not be valid, so deselect the
    // tabs before updating so we don't get spurious changes in the index,
    // which would then set off another sync cycle.
    this.updatingTabs = true;
    this.luminoWidget.currentIndex = null;
    this.childrenViews?.update(this.model.get('children'));
    this.luminoWidget.currentIndex = this.model.get('selected_index');
    this.updatingTabs = false;
  }

  /**
   * Called when a child is added to children list.
   */
  addChildView(model: WidgetModel, index: number): Promise<DOMWidgetView> {
    // Placeholder widget to keep our position in the tab panel while we create the view.
    const label = this.model.get('titles')[index] || '';
    const tabs = this.luminoWidget;
    const placeholder = new Widget();
    placeholder.title.label = label;
    tabs.addWidget(placeholder);
    return this.create_child_view(model)
      .then((view: DOMWidgetView) => {
        const widget = view.luminoWidget;
        widget.title.label = placeholder.title.label;
        widget.title.closable = false;

        const i = ArrayExt.firstIndexOf(tabs.widgets, placeholder);
        // insert after placeholder so that if placeholder is selected, the
        // real widget will be selected now (this depends on the tab bar
        // insert behavior)
        tabs.insertWidget(i + 1, widget);
        placeholder.dispose();
        return view;
      })
      .catch(reject('Could not add child view to box', true));
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    // Update the selected index in the overall update method because it
    // should be run after the tabs have been updated. Otherwise the
    // selected index may not be a valid tab in the tab bar.
    this.updateSelectedIndex();
    return super.update();
  }

  /**
   * Updates the tab page titles.
   */
  updateTitles(): void {
    const titles = this.model.get('titles') || [];
    each(this.luminoWidget.widgets, (widget, i) => {
      widget.title.label = titles[i] || '';
    });
  }

  /**
   * Updates the selected index.
   */
  updateSelectedIndex(): void {
    this.luminoWidget.currentIndex = this.model.get('selected_index');
  }

  remove(): void {
    this.childrenViews = null;
    super.remove();
  }

  _onTabChanged(
    sender: TabBar<Widget>,
    args: TabBar.ICurrentChangedArgs<Widget>
  ): void {
    if (!this.updatingTabs) {
      const i = args.currentIndex;
      this.model.set('selected_index', i === -1 ? null : i);
      this.touch();
    }
  }

  /**
   * Handle the `tabMoved` signal from the tab bar.
   */
  _onTabMoved(
    sender: TabBar<Widget>,
    args: TabBar.ITabMovedArgs<Widget>
  ): void {
    const children = this.model.get('children').slice();
    ArrayExt.move(children, args.fromIndex, args.toIndex);
    this.model.set('children', children);
    this.touch();
  }

  updatingTabs = false;
  childrenViews: ViewList<DOMWidgetView> | null;
  luminoWidget: JupyterLuminoTabPanelWidget;
}

export class StackModel extends SelectionContainerModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'StackModel',
      _view_name: 'StackView',
    };
  }
}

export class StackView extends BoxView {
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.listenTo(this.model, 'change:selected_index', this.update_children);
  }

  update_children(): void {
    let child: any[];
    if (this.model.get('selected_index') === null) {
      child = [];
    } else {
      child = [this.model.get('children')[this.model.get('selected_index')]];
    }
    this.children_views?.update(child).then((views: DOMWidgetView[]) => {
      // Notify all children that their sizes may have changed.
      views.forEach((view) => {
        MessageLoop.postMessage(
          view.luminoWidget,
          Widget.ResizeMessage.UnknownSize
        );
      });
    });
  }
}
