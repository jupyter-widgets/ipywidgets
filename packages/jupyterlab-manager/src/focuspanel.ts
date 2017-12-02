// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * A widget that handles the abstractions common in the dock panel, such as focus.
 */

import {
    Panel
} from '@phosphor/widgets';


import {
  Message
} from '@phosphor/messaging';

export
class FocusPanel extends Panel {
  constructor() {
    super();
    this.node.tabIndex = -1;
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the widget's node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mousedown':
        this._ensureFocus();
        break;
    default:
        break;
    }
  }

  /**
   * Handle `after-attach` messages for the widget.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('mousedown', this);
  }

  /**
   * Handle `before-detach` messages for the widget.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this._ensureFocus();
  }

  /**
   * Ensure that the widget has focus.
   */
  private _ensureFocus(): void {
    if (!this.node.contains(document.activeElement)) {
      this.node.focus();
    }
  }
}
