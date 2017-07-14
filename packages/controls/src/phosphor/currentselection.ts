// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * A variety of convenience methods for maintaining a current selection
 */

import {
  ArrayExt
} from '@phosphor/algorithm';

import {
  ISignal, Signal
} from '@phosphor/signaling';

export
class Selection<T> {

  constructor(sequence: ReadonlyArray<T>, options: Selection.IOptions = {}) {
    this._array = sequence;
    this._insertBehavior = options.insertBehavior || 'select-item-if-needed';
    this._removeBehavior = options.removeBehavior || 'select-item-after';
  }

  /**
   * A signal emitted when the current item is changed.
   *
   * #### Notes
   * This signal is emitted when the currently selected item is changed either
   * through user or programmatic interaction.
   *
   * Notably, this signal is not emitted when the index of the current item
   * changes due to other items being inserted, removed, or moved, but the
   * current item remains the same. It is only emitted when the actual current
   * item is changed.
   */
  get selectionChanged(): ISignal<Selection<T>, Selection.ISelectionChangedArgs<T>> {
    return this._selectionChanged;
  }

  /**
   * Adjust for setting an item.
   *
   * This should be called *after* the set.
   *
   * @param index - The index set.
   * @param oldValue - The old value at the index.
   */
  adjustSelectionForSet(index: number): void {
    // We just need to send a signal if the currentValue changed.
    // Get the current index and value.
    let pi = this.index;
    let pv = this.value;

    // Exit early if this doesn't affect the selection
    if (index !== pi) {
        return;
    }

    this._updateSelectedValue();
    let cv = this.value;

    // The previous item is now null, since it is no longer in the array.
    this._previousValue = null;

    // Send signal if there was a change
    if (pv !== cv) {
        // Emit the current changed signal.
        this._selectionChanged.emit({
        previousIndex: pi, previousValue: pv,
        currentIndex: pi, currentValue: cv
        });
    }
  }


  /**
   * Get the currently selected item.
   *
   * #### Notes
   * This will be `null` if no item is selected.
   */
  get value(): T {
    return this._value;
  }

  /**
   * Set the currently selected item.
   *
   * #### Notes
   * If the item does not exist in the vector, the currentValue will be set to
   * `null`. This selects the first entry equal to the desired item.
   */
  set value(value: T) {
    if (value === null) {
      this.index = null;
    } else {
      this.index = ArrayExt.firstIndexOf(this._array, value);
    }
  }

  /**
   * Get the index of the currently selected item.
   *
   * #### Notes
   * This will be `null` if no item is selected.
   */
  get index(): number | null {
    return this._index;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * @param index - The index to select.
   *
   * #### Notes
   * If the value is out of range, the index will be set to `null`, which
   * indicates no item is selected.
   */
  set index(index: number | null) {
    // Coerce the value to an index.
    let i;
    if (index !== null) {
        i = Math.floor(index);
        if (i < 0 || i >= this._array.length) {
            i = null;
        }
    } else {
      i = null;
    }

    // Bail early if the index will not change.
    if (this._index === i) {
      return;
    }

    // Look up the previous index and item.
    let pi = this._index;
    let pv = this._value;

    // Update the state
    this._index = i;
    this._updateSelectedValue();
    this._previousValue = pv;

    // Emit the current changed signal.
    this._selectionChanged.emit({
      previousIndex: pi, previousValue: pv,
      currentIndex: i, currentValue: this._value
    });
  }

  /**
   * Get the selection behavior when inserting a tab.
   */
  get insertBehavior(): Selection.InsertBehavior {
    return this._insertBehavior;
  }

  /**
   * Set the selection behavior when inserting a tab.
   */
  set insertBehavior(value: Selection.InsertBehavior) {
    this._insertBehavior = value;
  }

  /**
   * Get the selection behavior when removing a tab.
   */
  get removeBehavior(): Selection.RemoveBehavior {
    return this._removeBehavior;
  }

  /**
   * Set the selection behavior when removing a tab.
   */
  set removeBehavior(value: Selection.RemoveBehavior) {
    this._removeBehavior = value;
  }


  /**
   * Adjust the current index for a tab insert operation.
   *
   * @param i - The new index of the inserted item.
   * @param j - The inserted item.
   *
   * #### Notes
   * This method accounts for the tab bar's insertion behavior when adjusting
   * the current index and emitting the changed signal. This should be called
   * after the insertion.
   */
  adjustSelectionForInsert(i: number, item: T): void {
    // Lookup commonly used variables.
    let cv = this._value;
    let ci = this._index;
    let bh = this._insertBehavior;

    // Handle the behavior where the new item is always selected,
    // or the behavior where the new item is selected if needed.
    if (bh === 'select-item' || (bh === 'select-item-if-needed' && ci === null)) {
      this._index = i;
      this._value = item;
      this._previousValue = cv;
      this._selectionChanged.emit({
        previousIndex: ci, previousValue: cv,
        currentIndex: i, currentValue: item
      });
      return;
    }

    // Otherwise, silently adjust the current index if needed.
    if (ci >= i) {
      this._index++;
    }
  }

  /**
   * Adjust the current index for move operation.
   *
   * @param i - The previous index of the item.
   * @param j - The new index of the item.
   *
   * #### Notes
   * This method will not cause the actual current item to change. It silently
   * adjusts the current index to account for the given move.
   */
  adjustSelectionForMove(i: number, j: number): void {
    if (this._index === i) {
      this._index = j;
    } else if (this._index < i && this._index >= j) {
      this._index++;
    } else if (this._index > i && this._index <= j) {
      this._index--;
    }
  }

  /**
   * Clear the selection and history.
   */
  clearSelection(): void {
    // Get the current index and item.
    let pi = this._index;
    let pv = this._value;

    // Reset the current index and previous item.
    this._index = null;
    this._value = null;
    this._previousValue = null;

    // If no item was selected, there's nothing else to do.
    if (pi === null) {
      return;
    }

    // Emit the current changed signal.
    this._selectionChanged.emit({
      previousIndex: pi, previousValue: pv,
      currentIndex: this._index, currentValue: this._value
    });
  }

  /**
   * Adjust the current index for an item remove operation.
   *
   * @param i - The former index of the removed item.
   * @param item - The removed item.
   *
   * #### Notes
   * This method accounts for the remove behavior when adjusting the current
   * index and emitting the changed signal. It should be called after the item
   * is removed.
   */
  adjustSelectionForRemove(i: number, item: T): void {
    // Lookup commonly used variables.
    let ci = this._index;
    let bh = this._removeBehavior;

    // Silently adjust the index if the current item is not removed.
    if (ci !== i) {
      if (ci > i) {
        this._index--;
      }
      return;
    }

    // No item gets selected if the vector is empty.
    if (this._array.length === 0) {
      // Reset the current index and previous item.
      this._index = null;
      this._value = null;
      this._previousValue = null;
      this._selectionChanged.emit({
        previousIndex: i, previousValue: item,
        currentIndex: this._index, currentValue: this._value
      });
      return;
    }

    // Handle behavior where the next sibling item is selected.
    if (bh === 'select-item-after') {
      this._index = Math.min(i, this._array.length - 1);
      this._updateSelectedValue();
      this._previousValue = null;
      this._selectionChanged.emit({
        previousIndex: i, previousValue: item,
        currentIndex: this._index, currentValue: this._value
      });
      return;
    }

    // Handle behavior where the previous sibling item is selected.
    if (bh === 'select-item-before') {
      this._index = Math.max(0, i - 1);
      this._updateSelectedValue();
      this._previousValue = null;
      this._selectionChanged.emit({
        previousIndex: i, previousValue: item,
        currentIndex: this._index, currentValue: this._value
      });
      return;
    }

    // Handle behavior where the previous history item is selected.
    if (bh === 'select-previous-item') {
      if (this._previousValue) {
        this.value = this._previousValue;
      } else {
        this._index = Math.min(i, this._array.length - 1);
        this._updateSelectedValue();
      }
      this._previousValue = null;
      this._selectionChanged.emit({
        previousIndex: i, previousValue: item,
        currentIndex: this._index, currentValue: this.value
      });
      return;
    }

    // Otherwise, no item gets selected.
    this._index = null;
    this._value = null;
    this._previousValue = null;
    this._selectionChanged.emit({
      previousIndex: i, previousValue: item,
      currentIndex: this._index, currentValue: this._value
    });
  }

  /**
   * Set the current value based on the current index.
   */
  private _updateSelectedValue() {
    let i = this._index;
    this._value = i !== null ? this._array[i] : null;
  }

  private _array: ReadonlyArray<T> = null;
  private _index: number;
  private _value: T = null;
  private _previousValue: T = null;
  private _insertBehavior: Selection.InsertBehavior;
  private _removeBehavior: Selection.RemoveBehavior;
  private _selectionChanged = new Signal<Selection<T>, Selection.ISelectionChangedArgs<T>>(this);
}

export
namespace Selection {
  /**
   * An options object for creating a tab bar.
   */
  export
  interface IOptions {
    /**
     * The selection behavior when inserting a tab.
     *
     * The default is `'select-tab-if-needed'`.
     */
    insertBehavior?: Selection.InsertBehavior;

    /**
     * The selection behavior when removing a tab.
     *
     * The default is `'select-tab-after'`.
     */
    removeBehavior?: Selection.RemoveBehavior;
  }

  /**
   * The arguments object for the `currentChanged` signal.
   */
  export
  interface ISelectionChangedArgs<T> {
    /**
     * The previously selected index.
     */
    previousIndex: number;

    /**
     * The previous selected item.
     */
    previousValue: T;

    /**
     * The currently selected index.
     */
    currentIndex: number;

    /**
     * The currently selected item.
     */
    currentValue: T;
  }


  /**
   * A type alias for the selection behavior on item insert.
   */
  export
  type InsertBehavior = (
    /**
     * The selected item will not be changed.
     */
    'none' |

    /**
     * The inserted item will be selected.
     */
    'select-item' |

    /**
     * The inserted item will be selected if the current item is null.
     */
    'select-item-if-needed'
  );

  /**
   * A type alias for the selection behavior on item remove.
   */
  export
  type RemoveBehavior = (
    /**
     * No item will be selected.
     */
    'none' |

    /**
     * The item after the removed item will be selected if possible.
     */
    'select-item-after' |

    /**
     * The item before the removed item will be selected if possible.
     */
    'select-item-before' |

    /**
     * The previously selected item will be selected if possible.
     */
    'select-previous-item'
  );
}
