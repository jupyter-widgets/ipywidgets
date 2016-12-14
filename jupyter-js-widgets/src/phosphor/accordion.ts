import {
  ISequence
} from 'phosphor/lib/algorithm/sequence';

import {
  ISignal, defineSignal
} from 'phosphor/lib/core/signaling';

import {
  Panel, PanelLayout
} from 'phosphor/lib/ui/panel';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  Title
} from 'phosphor/lib/ui/title';

import {
    Selection
} from './currentselection';

import {
  findIndex
} from 'phosphor/lib/algorithm/searching';

/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export
class Collapse extends Widget {
  constructor(options: Collapse.IOptions) {
    super(options);
    this._header = new Widget();
    this._header.node.addEventListener('click', this);

    let layout = new PanelLayout();
    layout.addWidget(this._header);

    if (options.widget) {
      this.widget = options.widget;
    }

    this.layout = layout;
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._header = null;
    this._widget = null;
  }

  get widget() {
    return this._widget;
  }

  set widget(widget: Widget) {
    let layout = this.layout as PanelLayout;
    if (this._widget) {
      this._widget.title.changed.disconnect(this._onTitleChanged, this);
      layout.removeWidget(this._widget);
    }
    if (this.collapsed) {
      widget.hide();
    } else {
      widget.show();
    }
    widget.title.changed.connect(this._onTitleChanged, this);
    this._onTitleChanged(widget.title);
    layout.addWidget(widget);
    this._widget = widget;
  }

  get collapsed() {
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

  toggle() {
    this.collapsed = !this.collapsed;
  }

  collapseChanged: ISignal<Collapse, void>;

  private _collapse() {
    this._collapsed = true;
    this._widget.hide();
    this.collapseChanged.emit(void 0);
  }
  private _uncollapse() {
    this._collapsed = false;
    this._widget.show();
    this.collapseChanged.emit(void 0);
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

  private _evtClick(event: MouseEvent) {
    this.toggle();
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title): void {
    this._header.node.textContent = this._widget.title.label;
  }

  _collapsed: boolean;
  _widget: Widget;
  _header: Widget;
}

export
namespace Collapse {
  export
  interface IOptions extends Widget.IOptions {
    widget: Widget;
  }
}

// Define the signals for the `Widget` class.
defineSignal(Collapse.prototype, 'collapseChanged');


/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export
class Accordion extends Panel {

  constructor(options?: Accordion.IOptions) {
    super(options);
    this._selection = new Selection(this.widgets as ISequence<Collapse>);
    this._selection.selectionChanged.connect(this._onSelectionChanged, this);
  }

  /**
   * A read-only sequence of the widgets in the panel.
   *
   * #### Notes
   * This is a read-only property.
   */
  get widgets(): ISequence<Collapse> {
    return (this.layout as PanelLayout).widgets as ISequence<Collapse>;
  }

  get selection(): Selection<Collapse> {
    return this._selection;
  }

  /**
   * Add a widget to the end of the accordion.
   *
   * @param widget - The widget to add to the accordion.
   *
   * #### Notes
   * The widget will be wrapped in a CollapsedWidget.
   */
  addWidget(widget: Widget): void {
    let collapse = this._wrapWidget(widget);
    super.addWidget(collapse);
    this._selection.adjustSelectionForInsert(this.widgets.length - 1, collapse);
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
    let collapse = this._wrapWidget(widget);
    super.insertWidget(index, collapse);
    this._selection.adjustSelectionForInsert(index, collapse);
  }

  removeWidget(widget: Widget): void {
    let index = findIndex(this.widgets, (w) => w.widget === widget);
    let collapse = this.widgets.at(index);
    let layout = this.layout as PanelLayout;
    layout.removeWidgetAt(index);
    this._selection.adjustSelectionForRemove(index, collapse);
  }

  private _wrapWidget(widget: Widget) {
    let collapse = new Collapse({ widget });
    widget.disposed.connect(() => collapse.dispose());
    return collapse;
  }

  private _onSelectionChanged(sender: Selection<Widget>, change: Selection.ISelectionChangedArgs<Collapse>) {
    // Collapse previous widget, open current widget
    let pv = change.previousValue;
    let cv = change.currentValue;
    if (pv) {
      pv.collapsed = true;
    }
    if (cv) {
      cv.collapsed = false;
    }
  }

  private _selection: Selection<Collapse>;
}

export
namespace Accordion {
  export
  type IOptions = Panel.IOptions;
}
