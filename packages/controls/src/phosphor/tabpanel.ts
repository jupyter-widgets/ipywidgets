/* This file has code derived from PhosphorJS. The license for this PhosphorJS code is:

Copyright (c) 2014-2017, PhosphorJS Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

import {
  MessageLoop
} from '@phosphor/messaging';

import {
  ISignal, Signal
} from '@phosphor/signaling';

import {
  Platform
} from '@phosphor/domutils';

import {
  BoxLayout, Panel, PanelLayout, TabBar, Widget
} from '@phosphor/widgets';



/**
 * A panel where visible widgets are stacked atop one another.
 *
 * #### Notes
 * This class provides a convenience wrapper around a [[PanelLayout]].
 */
export
class EventedPanel extends Panel {

  /**
   * A signal emitted when a widget is removed from the panel.
   */
  get widgetRemoved(): ISignal<EventedPanel, Widget> {
    return this._widgetRemoved;
  }


  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    this._widgetRemoved.emit(msg.child);
  }

  private _widgetRemoved = new Signal<EventedPanel, Widget>(this);
}


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
    this.addClass('p-TabPanel');

    // Create the tab bar and contents panel.
    this.tabBar = new TabBar<Widget>(options);
    this.tabBar.addClass('p-TabPanel-tabBar');
    this.tabContents = new EventedPanel();
    this.tabContents.addClass('p-TabPanel-tabContents');

    // Connect the tab bar signal handlers.
    this.tabBar.tabMoved.connect(this._onTabMoved, this);
    this.tabBar.currentChanged.connect(this._onCurrentChanged, this);
    this.tabBar.tabCloseRequested.connect(this._onTabCloseRequested, this);
    this.tabBar.tabActivateRequested.connect(this._onTabActivateRequested, this);

    // Connect the evented panel signal handlers.
    this.tabContents.widgetRemoved.connect(this._onWidgetRemoved, this);

    // Create the layout.
    let layout = new PanelLayout();

    // Add the child widgets to the layout.
    layout.addWidget(this.tabBar);
    layout.addWidget(this.tabContents);

    // Install the layout on the tab panel.
    this.layout = layout;
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
  get currentChanged(): ISignal<this, TabPanel.ICurrentChangedArgs> {
    return this._currentChanged;
  }

  /**
   * Get the index of the currently selected tab.
   *
   * #### Notes
   * This will be `null` if no tab is selected.
   */
  get currentIndex(): number | null {
    const currentIndex = this.tabBar.currentIndex;
    // Phosphor tab bars have an index of -1 if no tab is selected
    return (currentIndex === -1 ? null : currentIndex);
  }

  /**
   * Set the index of the currently selected tab.
   *
   * #### Notes
   * If the index is out of range, it will be set to `null`.
   */
  set currentIndex(value: number | null) {
    this.tabBar.currentIndex = (value === null ? -1 : value);
  }

  /**
   * Get the currently selected widget.
   *
   * #### Notes
   * This will be `null` if there is no selected tab.
   */
  get currentWidget(): Widget | null {
    let title = this.tabBar.currentTitle;
    return title ? title.owner : null;
  }

  /**
   * Set the currently selected widget.
   *
   * #### Notes
   * If the widget is not in the panel, it will be set to `null`.
   */
  set currentWidget(value: Widget | null) {
    this.tabBar.currentTitle = value ? value.title : null;
  }

  /**
   * Get the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  get tabsMovable(): boolean {
    return this.tabBar.tabsMovable;
  }

  /**
   * Set the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  set tabsMovable(value: boolean) {
    this.tabBar.tabsMovable = value;
  }

  /**
   * The tab bar used by the tab panel.
   *
   * #### Notes
   * Modifying the tab bar directly can lead to undefined behavior.
   */
  readonly tabBar: TabBar<Widget>;

  /**
   * The panel used by the tab panel.
   *
   * #### Notes
   * Modifying the panel directly can lead to undefined behavior.
   */
  readonly tabContents: EventedPanel;

  /**
   * A read-only array of the widgets in the panel.
   */
  get widgets(): ReadonlyArray<Widget> {
    return this.tabContents.widgets;
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
    this.tabContents.insertWidget(index, widget);
    this.tabBar.insertTab(index, widget.title);
  }

  /**
   * Handle the `currentChanged` signal from the tab bar.
   */
  private _onCurrentChanged(sender: TabBar<Widget>, args: TabBar.ICurrentChangedArgs<Widget>): void {
    // Extract the previous and current title from the args.
    let { previousIndex, previousTitle, currentIndex, currentTitle } = args;

    // Extract the widgets from the titles.
    let previousWidget = previousTitle ? previousTitle.owner : null;
    let currentWidget = currentTitle ? currentTitle.owner : null;

    // Hide the previous widget.
    if (previousWidget) {
      previousWidget.hide();
    }

    // Show the current widget.
    if (currentWidget) {
      currentWidget.show();
    }

    // Emit the `currentChanged` signal for the tab panel.
    this._currentChanged.emit({
      previousIndex, previousWidget, currentIndex, currentWidget
    });

    // Flush the message loop on IE and Edge to prevent flicker.
    if (Platform.IS_EDGE || Platform.IS_IE) {
      MessageLoop.flush();
    }
  }

  /**
   * Handle the `tabActivateRequested` signal from the tab bar.
   */
  private _onTabActivateRequested(sender: TabBar<Widget>, args: TabBar.ITabActivateRequestedArgs<Widget>): void {
    args.title.owner.activate();
  }

  /**
   * Handle the `tabCloseRequested` signal from the tab bar.
   */
  private _onTabCloseRequested(sender: TabBar<Widget>, args: TabBar.ITabCloseRequestedArgs<Widget>): void {
    args.title.owner.close();
  }

  /**
   * Handle the `tabMoved` signal from the tab bar.
   */
  private _onTabMoved(sender: TabBar<Widget>, args: TabBar.ITabMovedArgs<Widget>): void {
    this.tabContents.insertWidget(args.toIndex, args.title.owner);
  }

  /**
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: EventedPanel, widget: Widget): void {
    this.tabBar.removeTab(widget.title);
  }

  private _currentChanged = new Signal<this, TabPanel.ICurrentChangedArgs>(this);
}


/**
 * The namespace for the `TabPanel` class statics.
 */
export
namespace TabPanel {

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
     * The renderer for the panel's tab bar.
     *
     * The default is a shared renderer instance.
     */
    renderer?: TabBar.IRenderer<Widget>;
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
    previousWidget: Widget | null;

    /**
     * The currently selected index.
     */
    currentIndex: number;

    /**
     * The currently selected widget.
     */
    currentWidget: Widget | null;
  }
}


