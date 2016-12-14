import {
  ChildMessage, Widget
} from 'phosphor/lib/ui/widget';


/**
 * An indexed widget maintains one of its children as a current widget and current index.
 */
export
class IndexedWidget<T> extends Widget {

  /**
   * Get the currently selected title.
   *
   * #### Notes
   * This will be `null` if no tab is selected.
   */
  get currentItem(): T {
    let i = this._currentIndex;
    return i !== -1 ? this._items.at(i) : null;
  }

  /**
   * Set the currently selected title.
   *
   * #### Notes
   * If the title does not exist, the title will be set to `null`.
   */
  set currentTitle(value: Title) {
    this.currentIndex = indexOf(this._items, value);
  }

  /**
   * Get the index of the currently selected tab.
   *
   * #### Notes
   * This will be `-1` if no tab is selected.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * #### Notes
   * If the value is out of range, the index will be set to `-1`.
   */
  set currentIndex(value: number) {
    // Coerce the value to an index.
    let i = Math.floor(value);
    if (i < 0 || i >= this._items.length) {
      i = -1;
    }

    // Bail early if the index will not change.
    if (this._currentIndex === i) {
      return;
    }

    // Look up the previous index and title.
    let pi = this._currentIndex;
    let pt = pi === -1 ? null : this._items.at(pi);

    // Look up the current index and title.
    let ci = i;
    let ct = ci === -1 ? null : this._items.at(ci);

    // Update the current index and previous title.
    this._currentIndex = ci;
    this._previousTitle = pt;

    // Emit the current changed signal.
    this.currentChanged.emit({
      previousIndex: pi, previousTitle: pt,
      currentIndex: ci, currentTitle: ct
    });

    // Schedule an update of the tabs.
    this.update();
  }

  /**
   * Get whether a tab can be deselected by the user.
   *
   * #### Notes
   * Tabs can be always be deselected programmatically.
   */
  get allowDeselect(): boolean {
    return this._allowDeselect;
  }

  /**
   * Set whether a tab can be deselected by the user.
   *
   * #### Notes
   * Tabs can be always be deselected programmatically.
   */
  set allowDeselect(value: boolean) {
    this._allowDeselect = value;
  }

  /**
   * Get the selection behavior when inserting a tab.
   */
  get insertBehavior(): TabBar.InsertBehavior {
    return this._insertBehavior;
  }

  /**
   * Set the selection behavior when inserting a tab.
   */
  set insertBehavior(value: TabBar.InsertBehavior) {
    this._insertBehavior = value;
  }

  /**
   * Get the selection behavior when removing a tab.
   */
  get removeBehavior(): TabBar.RemoveBehavior {
    return this._removeBehavior;
  }

  /**
   * Set the selection behavior when removing a tab.
   */
  set removeBehavior(value: TabBar.RemoveBehavior) {
    this._removeBehavior = value;
  }


  private _insertBehavior: IndexedWidget.InsertBehavior;
  private _removeBehavior: IndexedWidget.RemoveBehavior;
}


export
namespace IndexedWidget {
  /**
   * An options object for creating a tab bar.
   */
  export
  interface IOptions {
    /**
     * Whether an item can be deselected by the user.
     *
     * The default is `false`.
     */
    allowDeselect?: boolean;

    /**
     * The selection behavior when inserting a tab.
     *
     * The default is `'select-tab-if-needed'`.
     */
    insertBehavior?: IndexedWidget.InsertBehavior;

    /**
     * The selection behavior when removing a tab.
     *
     * The default is `'select-tab-after'`.
     */
    removeBehavior?: IndexedWidget.RemoveBehavior;
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
     * The previous selected item.
     */
    previousItem: any;

    /**
     * The currently selected index.
     */
    currentIndex: number;
  }


  /**
   * A type alias for the selection behavior on tab insert.
   */
  export
  type InsertBehavior = (
    /**
     * The selected tab will not be changed.
     */
    'none' |

    /**
     * The inserted tab will be selected.
     */
    'select' |

    /**
     * The inserted tab will be selected if the current tab is null.
     */
    'select-if-needed'
  );

  /**
   * A type alias for the selection behavior on tab remove.
   */
  export
  type RemoveBehavior = (
    /**
     * No tab will be selected.
     */
    'none' |

    /**
     * The tab after the removed tab will be selected if possible.
     */
    'select-after' |

    /**
     * The tab before the removed tab will be selected if possible.
     */
    'select-before' |

    /**
     * The previously selected tab will be selected if possible.
     */
    'select-previous'
  );
}
