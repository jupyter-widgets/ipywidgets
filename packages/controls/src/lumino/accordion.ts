// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ArrayExt } from '@lumino/algorithm';

import { ISignal, Signal } from '@lumino/signaling';

import { Panel, PanelLayout, Widget, Title } from '@lumino/widgets';

import { Selection } from './currentselection';

/**
 * The class name added to Collapse instances.
 */
const COLLAPSE_CLASS = 'jupyter-widget-Collapse';

/**
 * The class name added to a Collapse's header.
 */
const COLLAPSE_HEADER_CLASS = 'jupyter-widget-Collapse-header';

/**
 * The class name added to a Collapse's contents.
 */
const COLLAPSE_CONTENTS_CLASS = 'jupyter-widget-Collapse-contents';

/**
 * The class name added to a Collapse when it is opened
 */
const COLLAPSE_CLASS_OPEN = 'jupyter-widget-Collapse-open';

/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export class Collapse extends Widget {
  constructor(options: Collapse.IOptions) {
    super(options);
    this.addClass(COLLAPSE_CLASS);
    this._header = new Widget();
    this._header.addClass(COLLAPSE_HEADER_CLASS);
    this._header.node.addEventListener('click', this);
    // Fontawesome icon for caret
    const icon = document.createElement('i');
    icon.classList.add('fa', 'fa-fw', 'fa-caret-right');
    this._header.node.appendChild(icon);
    // Label content
    this._header.node.appendChild(document.createElement('span'));

    this._content = new Panel();
    this._content.addClass(COLLAPSE_CONTENTS_CLASS);

    const layout = new PanelLayout();
    this.layout = layout;
    layout.addWidget(this._header);
    layout.addWidget(this._content);
    if (options.widget) {
      this.widget = options.widget;
    }
    this.collapsed = false;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._header = null!;
    this._widget = null!;
    this._content = null!;
  }

  get widget(): Widget {
    return this._widget;
  }

  set widget(widget: Widget) {
    const oldWidget = this._widget;
    if (oldWidget) {
      oldWidget.disposed.disconnect(this._onChildDisposed, this);
      oldWidget.title.changed.disconnect(this._onTitleChanged, this);
      oldWidget.parent = null;
    }
    this._widget = widget;
    widget.disposed.connect(this._onChildDisposed, this);
    widget.title.changed.connect(this._onTitleChanged, this);
    this._onTitleChanged(widget.title);
    this._content.addWidget(widget);
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    // TODO: should we have this check here?
    if (value === this._collapsed) {
      return;
    }
    if (value) {
      this._collapse();
    } else {
      this._uncollapse();
    }
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  get collapseChanged(): ISignal<Collapse, void> {
    return this._collapseChanged;
  }

  private _collapse(): void {
    this._collapsed = true;
    if (this._content) {
      this._content.hide();
    }
    this.removeClass(COLLAPSE_CLASS_OPEN);
    this._header.node.children[0].classList.add('fa-caret-right');
    this._header.node.children[0].classList.remove('fa-caret-down');
    this._collapseChanged.emit(void 0);
  }

  private _uncollapse(): void {
    this._collapsed = false;
    if (this._content) {
      this._content.show();
    }
    this.addClass(COLLAPSE_CLASS_OPEN);
    this._header.node.children[0].classList.add('fa-caret-down');
    this._header.node.children[0].classList.remove('fa-caret-right');
    this._collapseChanged.emit(void 0);
  }

  /**
   * Handle the DOM events for the Collapse widget.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        this._evtClick(event as MouseEvent);
        break;
      default:
        break;
    }
  }

  private _evtClick(event: MouseEvent): void {
    this.toggle();
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title<Widget>): void {
    this._header.node.children[1].textContent = this._widget.title.label;
  }

  private _onChildDisposed(sender: Widget): void {
    this.dispose();
  }

  private _collapseChanged = new Signal<Collapse, void>(this);

  _collapsed: boolean;
  _content: Panel;
  _widget: Widget;
  _header: Widget;
}

export namespace Collapse {
  export interface IOptions extends Widget.IOptions {
    widget: Widget;
  }
}

/**
 * The class name added to Accordion instances.
 */
const ACCORDION_CLASS = 'jupyter-widget-Accordion';

/**
 * The class name added to an Accordion child.
 */
const ACCORDION_CHILD_CLASS = 'jupyter-widget-Accordion-child';

const ACCORDION_CHILD_ACTIVE_CLASS = 'jupyter-widget-Accordion-child-active';

/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export class Accordion extends Panel {
  constructor(options?: Accordion.IOptions) {
    super(options);
    this._selection = new Selection(this.widgets as ReadonlyArray<Collapse>);
    this._selection.selectionChanged.connect(this._onSelectionChanged, this);
    this.addClass(ACCORDION_CLASS);
  }

  /**
   * A read-only sequence of the widgets in the panel.
   *
   * #### Notes
   * This is a read-only property.
   */
  /*  get widgets(): ISequence<Widget> {
    return new ArraySequence(toArray(map((this.layout as PanelLayout).widgets, (w: Collapse) => w.widget)));
  }
*/
  get collapseWidgets(): ReadonlyArray<Collapse> {
    return (this.layout as PanelLayout).widgets as ReadonlyArray<Collapse>;
  }

  get selection(): Selection<Collapse> {
    return this._selection;
  }

  indexOf(widget: Widget): number {
    return ArrayExt.findFirstIndex(
      this.collapseWidgets,
      (w: Collapse) => w.widget === widget
    );
  }

  /**
   * Add a widget to the end of the accordion.
   *
   * @param widget - The widget to add to the accordion.
   *
   * @returns The Collapse widget wrapping the added widget.
   *
   * #### Notes
   * The widget will be wrapped in a CollapsedWidget.
   */
  addWidget(widget: Widget): Widget {
    const collapse = this._wrapWidget(widget);
    collapse.collapsed = true;
    super.addWidget(collapse);
    this._selection.adjustSelectionForInsert(this.widgets.length - 1, collapse);
    return collapse;
  }

  /**
   * Insert a widget at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into to the accordion.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   */
  insertWidget(index: number, widget: Widget): void {
    const collapse = this._wrapWidget(widget);
    collapse.collapsed = true;
    super.insertWidget(index, collapse);
    this._selection.adjustSelectionForInsert(index, collapse);
  }

  removeWidget(widget: Widget): void {
    const index = this.indexOf(widget);
    if (index >= 0) {
      const collapse = this.collapseWidgets[index] as Collapse;
      widget.parent = null;
      collapse.dispose();
      this._selection.adjustSelectionForRemove(index, null);
    }
  }

  private _wrapWidget(widget: Widget): Collapse {
    const collapse = new Collapse({ widget });
    collapse.addClass(ACCORDION_CHILD_CLASS);
    collapse.collapseChanged.connect(this._onCollapseChange, this);
    return collapse;
  }

  private _onCollapseChange(sender: Collapse): void {
    if (!sender.collapsed) {
      this._selection.value = sender;
    } else if (this._selection.value === sender && sender.collapsed) {
      this._selection.value = null;
    }
  }

  private _onSelectionChanged(
    sender: Selection<Widget>,
    change: Selection.ISelectionChangedArgs<Collapse>
  ): void {
    // Collapse previous widget, open current widget
    const pv = change.previousValue;
    const cv = change.currentValue;
    if (pv) {
      pv.collapsed = true;
      pv.removeClass(ACCORDION_CHILD_ACTIVE_CLASS);
    }
    if (cv) {
      cv.collapsed = false;
      cv.addClass(ACCORDION_CHILD_ACTIVE_CLASS);
    }
  }

  private _selection: Selection<Collapse>;
}

export namespace Accordion {
  export type IOptions = Panel.IOptions;
}
