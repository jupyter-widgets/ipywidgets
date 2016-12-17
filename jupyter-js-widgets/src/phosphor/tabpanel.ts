/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  ISequence
} from 'phosphor/lib/algorithm/sequence';

import {
  ISignal, defineSignal
} from 'phosphor/lib/core/signaling';

import {
  BoxLayout
} from 'phosphor/lib/ui/boxpanel';

import {
  Panel, PanelLayout
} from 'phosphor/lib/ui/panel';

import {
  TabBar
} from 'phosphor/lib/ui/tabbar';

import {
  ChildMessage, Widget
} from 'phosphor/lib/ui/widget';

/**
 * The class name added to TabPanel instances.
 */
const TAB_PANEL_CLASS = 'p-TabPanel';

/**
 * The class name added to a TabPanel's tab bar.
 */
const TAB_BAR_CLASS = 'p-TabPanel-tabBar';

/**
 * The class name added to a TabPanel's stacked panel.
 */
const TAB_CONTENTS_CLASS = 'p-TabPanel-tabContents';

/**
 * The class name added to a StackedPanel child.
 */
const CHILD_CLASS = 'p-TabPanel-child';


/**
 * A panel where visible widgets are stacked atop one another.
 *
 * #### Notes
 * This class provides a convenience wrapper around a [[StackedLayout]].
 */
export
class EventedPanel extends Panel {
  /**
   * Construct a new stacked panel.
   *
   * @param options - The options for initializing the panel.
   */
  constructor(options: Panel.IOptions = {}) {
    super();
    this.addClass(TAB_CONTENTS_CLASS);
  }

  /**
   * A signal emitted when a widget is removed from a stacked panel.
   */
  widgetRemoved: ISignal<EventedPanel, Widget>;

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildMessage): void {
    msg.child.addClass(CHILD_CLASS);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    msg.child.removeClass(CHILD_CLASS);
    this.widgetRemoved.emit(msg.child);
  }
}

// Define the signals for the `EventedPanel` class.
defineSignal(EventedPanel.prototype, 'widgetRemoved');



/**
 * A widget which combines a `TabBar` and a `EventedPanel`.
 *
 * #### Notes
 * This is a simple panel which handles the common case of a tab bar
 * placed next to a content area. The selected tab controls the widget
 * which is shown in the content area.
 *
 * For use cases which require more control than is provided by this
 * panel, the `TabBar` widget may be used independently.
 * 
 * TODO: Support setting the direction??
 */
export
class TabPanel extends Widget {
  /**
   * Construct a new tab panel.
   *
   * @param options - The options for initializing the tab panel.
   */
  constructor(options: TabPanel.IOptions = {}) {
    super();
    this.addClass(TAB_PANEL_CLASS);

    // Create the tab bar and stacked panel.
    this._tabBar = new TabBar(options);
    this._tabBar.tabsMovable = true;
    this._tabBar.addClass(TAB_BAR_CLASS);
    this._tabContents = new EventedPanel();
    this._tabContents.addClass(TAB_CONTENTS_CLASS);

    // Connect the tab bar signal handlers.
    this._tabBar.tabMoved.connect(this._onTabMoved, this);
    this._tabBar.currentChanged.connect(this._onCurrentChanged, this);
    this._tabBar.tabCloseRequested.connect(this._onTabCloseRequested, this);

    // Connect the stacked panel signal handlers.
    this._tabContents.widgetRemoved.connect(this._onWidgetRemoved, this);

    // Get the data related to the placement.
    this._tabPlacement = options.tabPlacement || 'top';
    let direction = Private.directionFromPlacement(this._tabPlacement);
    let orientation = Private.orientationFromPlacement(this._tabPlacement);

    // Configure the tab bar for the placement.
    this._tabBar.orientation = orientation;
    this._tabBar.addClass(`p-mod-${this._tabPlacement}`);

    // Create the box layout.
    let layout = new PanelLayout();

    // Add the child widgets to the layout.
    layout.addWidget(this._tabBar);
    layout.addWidget(this._tabContents);

    // Install the layout on the tab panel.
    this.layout = layout;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._tabBar = null;
    this._tabContents = null;
    super.dispose();
  }

  /**
   * A signal emitted when the current tab is changed.
   *
   * #### Notes
   * This signal is emitted when the currently selected tab is changed
   * either through user or programmatic interaction.
   *
   * Notably, this signal is not emitted when the index of the current
   * tab changes due to tabs being inserted, removed, or moved. It is
   * only emitted when the actual current tab node is changed.
   */
  currentChanged: ISignal<TabPanel, TabPanel.ICurrentChangedArgs>;

  /**
   * Get the index of the currently selected tab.
   *
   * #### Notes
   * This will be `-1` if no tab is selected.
   */
  get currentIndex(): number {
    return this._tabBar.currentIndex;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * #### Notes
   * If the index is out of range, it will be set to `-1`.
   */
  set currentIndex(value: number) {
    this._tabBar.currentIndex = value;
  }

  /**
   * Get the currently selected widget.
   *
   * #### Notes
   * This will be `null` if there is no selected tab.
   */
  get currentWidget(): Widget {
    let title = this._tabBar.currentTitle;
    return title ? title.owner as Widget : null;
  }

  /**
   * Set the currently selected widget.
   *
   * #### Notes
   * If the widget is not in the panel, it will be set to `null`.
   */
  set currentWidget(value: Widget) {
    this._tabBar.currentTitle = value ? value.title : null;
  }

  /**
   * Get the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  get tabsMovable(): boolean {
    return this._tabBar.tabsMovable;
  }

  /**
   * Set the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  set tabsMovable(value: boolean) {
    this._tabBar.tabsMovable = value;
  }

  /**
   * Get the tab placement for the tab panel.
   *
   * #### Notes
   * This controls the position of the tab bar relative to the content.
   */
  get tabPlacement(): TabPanel.TabPlacement {
    return this._tabPlacement;
  }

  /**
   * Set the tab placement for the tab panel.
   *
   * #### Notes
   * This controls the position of the tab bar relative to the content.
   */
  set tabPlacement(value: TabPanel.TabPlacement) {
    // Bail if the placement does not change.
    if (this._tabPlacement === value) {
      return;
    }

    // Swap the internal values.
    let old = this._tabPlacement;
    this._tabPlacement = value;

    // Get the values related to the placement.
    let direction = Private.directionFromPlacement(value);
    let orientation = Private.orientationFromPlacement(value);

    // Configure the tab bar for the placement.
    this._tabBar.orientation = orientation;
    this._tabBar.removeClass(`p-mod-${old}`);
    this._tabBar.addClass(`p-mod-${value}`);

    // Update the layout direction.
    (this.layout as BoxLayout).direction = direction;
  }

  /**
   * The tab bar associated with the tab panel.
   *
   * #### Notes
   * Modifying the tab bar directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get tabBar(): TabBar {
    return this._tabBar;
  }

  /**
   * The stacked panel associated with the tab panel.
   *
   * #### Notes
   * Modifying the stack directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get tabContents(): Panel {
    return this._tabContents;
  }

  /**
   * A read-only sequence of the widgets in the panel.
   *
   * #### Notes
   * This is a read-only property.
   */
  get widgets(): ISequence<Widget> {
    return this._tabContents.widgets;
  }

  /**
   * Add a widget to the end of the tab panel.
   *
   * @param widget - The widget to add to the tab panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   *
   * The widget's `title` is used to populate the tab.
   */
  addWidget(widget: Widget): void {
    this.insertWidget(this.widgets.length, widget);
  }

  /**
   * Insert a widget into the tab panel at a specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into to the tab panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   *
   * The widget's `title` is used to populate the tab.
   */
  insertWidget(index: number, widget: Widget): void {
    if (widget !== this.currentWidget) {
      widget.hide();
    }
    this._tabContents.insertWidget(index, widget);
    this._tabBar.insertTab(index, widget.title);
  }

  /**
   * Handle the `currentChanged` signal from the tab bar.
   */
  private _onCurrentChanged(sender: TabBar, args: TabBar.ICurrentChangedArgs): void {
    // Extract the previous and current title from the args.
    let { previousIndex, previousTitle, currentIndex, currentTitle } = args;

    // Extract the widgets from the titles.
    let previousWidget = previousTitle ? previousTitle.owner as Widget : null;
    let currentWidget = currentTitle ? currentTitle.owner as Widget : null;

    // Hide the previous widget.
    if (previousWidget) {
      previousWidget.hide();
    }

    // Show the current widget.
    if (currentWidget) {
      currentWidget.show();
    }

    // Emit the `currentChanged` signal for the tab panel.
    this.currentChanged.emit({
      previousIndex, previousWidget, currentIndex, currentWidget
    });
  }

  /**
   * Handle the `tabActivateRequested` signal from the tab bar.
   */
  private _onTabActivateRequested(sender: TabBar, args: TabBar.ITabActivateRequestedArgs): void {
    (args.title.owner as Widget).activate();
  }

  /**
   * Handle the `tabCloseRequested` signal from the tab bar.
   */
  private _onTabCloseRequested(sender: TabBar, args: TabBar.ITabCloseRequestedArgs): void {
    (args.title.owner as Widget).close();
  }

  /**
   * Handle the `tabMoved` signal from the tab bar.
   */
  private _onTabMoved(sender: TabBar, args: TabBar.ITabMovedArgs): void {
    this._tabContents.insertWidget(args.toIndex, args.title.owner as Widget);
  }

  /**
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: Panel, widget: Widget): void {
    this._tabBar.removeTab(widget.title);
  }

  private _tabBar: TabBar;
  private _tabContents: EventedPanel;
  private _tabPlacement: TabPanel.TabPlacement;
}


// Define the signals for the `TabPanel` class.
defineSignal(TabPanel.prototype, 'currentChanged');


/**
 * The namespace for the `TabPanel` class statics.
 */
export
namespace TabPanel {
  /**
   * A type alias for tab placement in a tab bar.
   */
  export
  type TabPlacement = (
    /**
     * The tabs are placed as a row above the content.
     */
    'top' |

    /**
     * The tabs are placed as a column to the left of the content.
     */
    'left' |

    /**
     * The tabs are placed as a column to the right of the content.
     */
    'right' |

    /**
     * The tabs are placed as a row below the content.
     */
    'bottom'
  );

  /**
   * An options object for initializing a tab panel.
   */
  export
  interface IOptions {
    /**
     * Whether the tabs are movable by the user.
     *
     * The default is `false`.
     */
    tabsMovable?: boolean;

    /**
     * The placement of the tab bar relative to the content.
     *
     * The default is `'top'`.
     */
    tabPlacement?: TabPlacement;

    /**
     * The renderer for the panel's tab bar.
     *
     * The default is shared renderer instance.
     */
    renderer?: TabBar.IRenderer;
  }

  /**
   * The arguments object for the `currentChanged` signal.
   */
  export
  interface ICurrentChangedArgs {
    /**
     * The previously selected index.
     */
    previousIndex: number;

    /**
     * The previously selected widget.
     */
    previousWidget: Widget;

    /**
     * The currently selected index.
     */
    currentIndex: number;

    /**
     * The currently selected widget.
     */
    currentWidget: Widget;
  }
}


/**
 * The namespace for the private module data.
 */
namespace Private {
  /**
   * Convert a tab placement to tab bar orientation.
   */
  export
  function orientationFromPlacement(plc: TabPanel.TabPlacement): TabBar.Orientation {
    return placementToOrientationMap[plc];
  }

  /**
   * Convert a tab placement to a box layout direction.
   */
  export
  function directionFromPlacement(plc: TabPanel.TabPlacement): BoxLayout.Direction {
    return placementToDirectionMap[plc];
  }

  /**
   * A mapping of tab placement to tab bar orientation.
   */
  const placementToOrientationMap: { [key: string]: TabBar.Orientation } = {
    'top': 'horizontal',
    'left': 'vertical',
    'right': 'vertical',
    'bottom': 'horizontal'
  };

  /**
   * A mapping of tab placement to box layout direction.
   */
  const placementToDirectionMap: { [key: string]: BoxLayout.Direction } = {
    'top': 'top-to-bottom',
    'left': 'left-to-right',
    'right': 'right-to-left',
    'bottom': 'bottom-to-top'
  };
}


