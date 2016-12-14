// Derived from both https://github.com/phosphorjs/phosphor/blob/ed6c10e483a7aeb71bdd116ca870a9162d895662/src/ui/tabpanel.ts and https://github.com/phosphorjs/phosphor/blob/ed6c10e483a7aeb71bdd116ca870a9162d895662/src/collections/vector.ts, which have the following license:

/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/


import {
  IterableOrArrayLike
} from 'phosphor/lib/algorithm/iteration';

import {
  indexOf
} from 'phosphor/lib/algorithm/searching';

import {
  Vector
} from 'phosphor/lib/collections/vector';

import {
  ISignal, defineSignal
} from 'phosphor/lib/core/signaling';


class VectorWithSelection<T> extends Vector<T> {

  constructor(values?: IterableOrArrayLike<T>, options: VectorWithSelection.IOptions = {}) {
    super(values);
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
  currentChanged: ISignal<VectorWithSelection<T>, VectorWithSelection.ICurrentChangedArgs<T>>;


  /**
   * Add a value to the back of the vector.
   *
   * @param value - The value to add to the back of the vector.
   *
   * @returns The new length of the vector.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * No changes.
   */
  pushBack(value: T): number {
    let length = super.pushBack(value);
    this._adjustCurrentForInsert(length-1, value);
    return length;
  }

  /**
   * Remove and return the value at the back of the vector.
   *
   * @returns The value at the back of the vector, or `undefined` if
   *   the vector is empty.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * Iterators pointing at the removed value are invalidated.
   */
  popBack(): T {
    let item = super.popBack();
    this._adjustCurrentForRemove(this.length, item)
    return item;
  }

  /**
   * Insert a value into the vector at a specific index.
   *
   * @param index - The index at which to insert the value.
   *
   * @param value - The value to set at the specified index.
   *
   * @returns The new length of the vector.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * No changes.
   *
   * #### Notes
   * The `index` will be clamped to the bounds of the vector.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral.
   */
  insert(index: number, value: T): number {
    let length = super.insert(index, value);

    // We have to manually clamp the index for the adjustment to preserve the
    // semantics of the insert operatin.
    let i = Math.max(0, Math.min(index, this.length));
    this._adjustCurrentForInsert(i, value);

    return length;
  }

  /**
   * Remove the first occurrence of a value from the vector.
   *
   * @param value - The value of interest.
   *
   * @returns The index of the removed value, or `-1` if the value
   *   is not contained in the vector.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * Iterators pointing at the removed value and beyond are invalidated.
   *
   * #### Notes
   * Comparison is performed using strict `===` equality.
   */
  remove(value: T): number {
    let index = super.remove(value);
    if (index !== -1) {
      this._adjustCurrentForRemove(index, value);
    }
    return index;
  }

  /**
   * Remove and return the value at a specific index.
   *
   * @param index - The index of the value of interest.
   *
   * @returns The value at the specified index, or `undefined` if the
   *   index is out of range.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * Iterators pointing at the removed value and beyond are invalidated.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral.
   */
  removeAt(index: number): T {
    let item = super.removeAt(index);
    if (item !== void 0) {
      this._adjustCurrentForRemove(index, item)
    }
    return item;
  }

  /**
   * Remove all values from the vector.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * All current iterators are invalidated.
   *
   * #### Selection
   * The current item is unselected.
   */
  clear(): void {
    // Get the current index and item.
    let pi = this.currentIndex;
    let pt = this.currentItem;

    // Reset the current index and previous item.
    this._currentIndex = -1;
    this._previousItem = null;

    // Clear the item vector.
    super.clear();

    // If no item was selected, there's nothing else to do.
    if (pi === -1) {
      return;
    }

    // Emit the current changed signal.
    this.currentChanged.emit({
      previousIndex: pi, previousItem: pt,
      currentIndex: -1, currentItem: null
    });
  }

  /**
   * Swap the contents of the vector with the contents of another.
   *
   * @param other - The other vector holding the contents to swap.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * All current iterators remain valid, but will now point to the
   * contents of the other vector involved in the swap.
   *
   * #### Selection
   * The current index remains the same, but the current item reflects
   * the new vector.
   */
  swap(other: Vector<T>): void {
    // Get the current index and item.
    let pi = this.currentIndex;
    let pt = this.currentItem;

    super.swap(other);

    if (this.currentItem === pt) {
      return;
    }

    // Emit the current changed signal.
    this.currentChanged.emit({
      previousIndex: pi, previousItem: pt,
      currentIndex: pi, currentItem: this.currentItem
    });
  }


  /**
   * Get the currently selected item.
   *
   * #### Notes
   * This will be `null` if no item is selected.
   */
  get currentItem(): T {
    let i = this._currentIndex;
    return i !== -1 ? this.at(i) : null;
  }

  /**
   * Set the currently selected item.
   *
   * #### Notes
   * If the item does not exist in the vector, the currentItem will be set to
   * `null`. This selects the first entry equal to the desired item.
   */
  set currentItem(value: T) {
    this.currentIndex = indexOf(this, value);
  }

  /**
   * Get the index of the currently selected item.
   *
   * #### Notes
   * This will be `-1` if no item is selected.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * @param index - The index to select.
   *
   * #### Notes
   * If the value is out of range, the index will be set to `-1`, which
   * indicates no item is selected.
   */
  set currentIndex(index: number) {
    // Coerce the value to an index.
    let i = Math.floor(index);
    if (i < 0 || i >= this.length) {
      i = -1;
    }

    // Bail early if the index will not change.
    if (this._currentIndex === i) {
      return;
    }

    // Look up the previous index and item.
    let pi = this._currentIndex;
    let pt = pi === -1 ? null : this.at(pi);

    // Look up the current index and item.
    let ci = i;
    let ct = ci === -1 ? null : this.at(ci);

    // Update the current index and previous item.
    this._currentIndex = ci;
    this._previousItem = pt;

    // Emit the current changed signal.
    this.currentChanged.emit({
      previousIndex: pi, previousItem: pt,
      currentIndex: ci, currentItem: ct
    });
  }

  /**
   * Get the selection behavior when inserting a tab.
   */
  get insertBehavior(): VectorWithSelection.InsertBehavior {
    return this._insertBehavior;
  }

  /**
   * Set the selection behavior when inserting a tab.
   */
  set insertBehavior(value: VectorWithSelection.InsertBehavior) {
    this._insertBehavior = value;
  }

  /**
   * Get the selection behavior when removing a tab.
   */
  get removeBehavior(): VectorWithSelection.RemoveBehavior {
    return this._removeBehavior;
  }

  /**
   * Set the selection behavior when removing a tab.
   */
  set removeBehavior(value: VectorWithSelection.RemoveBehavior) {
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
  private _adjustCurrentForInsert(i: number, item: T): void {
    // Lookup commonly used variables.
    let ct = this.currentItem;
    let ci = this._currentIndex;
    let bh = this._insertBehavior;

    // Handle the behavior where the new item is always selected,
    // or the behavior where the new item is selected if needed.
    if (bh === 'select-item' || (bh === 'select-item-if-needed' && ci === -1)) {
      this._currentIndex = i;
      this._previousItem = ct;
      this.currentChanged.emit({
        previousIndex: ci, previousItem: ct,
        currentIndex: i, currentItem: item
      });
      return;
    }

    // Otherwise, silently adjust the current index if needed.
    if (ci >= i) this._currentIndex++;
  }

  /**
   * Adjust the current index for move operation.
   *
   * @param i - The previous index of the item.
   * @param j - The new index of the item.
   *
   * #### Notes
   * This method will not cause the actual current item to change. It silently
   * adjusts the current index to account for the given move. This should be
   * called after the move.
   */
  private _adjustCurrentForMove(i: number, j: number): void {
    if (this._currentIndex === i) {
      this._currentIndex = j;
    } else if (this._currentIndex < i && this._currentIndex >= j) {
      this._currentIndex++;
    } else if (this._currentIndex > i && this._currentIndex <= j) {
      this._currentIndex--;
    }
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
  private _adjustCurrentForRemove(i: number, item: T): void {
    // Lookup commonly used variables.
    let ci = this._currentIndex;
    let bh = this._removeBehavior;

    // Silently adjust the index if the current item is not removed.
    if (ci !== i) {
      if (ci > i) this._currentIndex--;
      return;
    }

    // No item gets selected if the vector is empty.
    if (this.length === 0) {
      this._currentIndex = -1;
      this.currentChanged.emit({
        previousIndex: i, previousItem: item,
        currentIndex: -1, currentItem: null
      });
      return;
    }

    // Handle behavior where the next sibling item is selected.
    if (bh === 'select-item-after') {
      this._currentIndex = Math.min(i, this.length - 1);
      this.currentChanged.emit({
        previousIndex: i, previousItem: item,
        currentIndex: this._currentIndex, currentItem: this.currentItem
      });
      return;
    }

    // Handle behavior where the previous sibling item is selected.
    if (bh === 'select-item-before') {
      this._currentIndex = Math.max(0, i - 1);
      this.currentChanged.emit({
        previousIndex: i, previousItem: item,
        currentIndex: this._currentIndex, currentItem: this.currentItem
      });
      return;
    }

    // Handle behavior where the previous history item is selected.
    if (bh === 'select-previous-item') {
      if (this._previousItem) {
        this._currentIndex = indexOf(this, this._previousItem);
        this._previousItem = null;
      } else {
        this._currentIndex = Math.min(i, this.length - 1);
      }
      this.currentChanged.emit({
        previousIndex: i, previousItem: item,
        currentIndex: this._currentIndex, currentItem: this.currentItem
      });
      return;
    }

    // Otherwise, no item gets selected.
    this._currentIndex = -1;
    this.currentChanged.emit({
      previousIndex: i, previousItem: item,
      currentIndex: -1, currentItem: null
    });
  }

  private _currentIndex: number;
  private _previousItem: T = null;
  private _insertBehavior: VectorWithSelection.InsertBehavior;
  private _removeBehavior: VectorWithSelection.RemoveBehavior;
}

// Define the signals for the `TabBar` class.
defineSignal(VectorWithSelection.prototype, 'currentChanged');

export
namespace VectorWithSelection {
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
    insertBehavior?: VectorWithSelection.InsertBehavior;

    /**
     * The selection behavior when removing a tab.
     *
     * The default is `'select-tab-after'`.
     */
    removeBehavior?: VectorWithSelection.RemoveBehavior;
  }

  /**
   * The arguments object for the `currentChanged` signal.
   */
  export
  interface ICurrentChangedArgs<T> {
    /**
     * The previously selected index.
     */
    previousIndex: number;

    /**
     * The previous selected item.
     */
    previousItem: T;

    /**
     * The currently selected index.
     */
    currentIndex: number;

    /**
     * The currently selected item.
     */
    currentItem: T;
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
