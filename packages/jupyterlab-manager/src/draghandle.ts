// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * A widget that abstracts out the drag operation to create a new panel in a dock area.
 */

import {
    Widget
} from '@phosphor/widgets';

import {
    Message
} from '@phosphor/messaging';

import {
    Drag
  } from '@phosphor/dragdrop';

import {
    MimeData
  } from '@phosphor/coreutils';

/**
 * The threshold in pixels to start a drag event.
 */
const DRAG_THRESHOLD = 5;


export
class DragHandle extends Widget {

  constructor(options: DragHandle.IOptions) {
    super();
    this._newWidget = options.newWidget;
    this.node.textContent = 'Drag';
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the notebook panel's node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mousedown':
      this._evtMouseDown(event as MouseEvent);
      break;
    case 'mouseup':
      this._evtMouseup(event as MouseEvent);
      break;
    case 'mousemove':
      this._evtMousemove(event as MouseEvent);
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
    let node = this.node;
    node.addEventListener('mousedown', this);
  }

  /**
   * Handle `before-detach` messages for the widget.
   */
  protected onBeforeDetach(msg: Message): void {
    let node = this.node;
    node.removeEventListener('mousedown', this);
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);
  }

  /**
   * Handle `mousedown` events for the widget.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // Left mouse press for drag start.
    if (event.button === 0) {
      this._dragData = { pressX: event.clientX, pressY: event.clientY };
      document.addEventListener('mouseup', this, true);
      document.addEventListener('mousemove', this, true);
      event.preventDefault();
    }
  }

  /**
   * Handle the `'mouseup'` event for the widget.
   */
  private _evtMouseup(event: MouseEvent): void {
    if (event.button !== 0 || !this._drag) {
      document.removeEventListener('mousemove', this, true);
      document.removeEventListener('mouseup', this, true);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'mousemove'` event for the widget.
   */
  private _evtMousemove(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Bail if we are the one dragging.
    if (this._drag) {
      return;
    }

    // Check for a drag initialization.
    let data = this._dragData;
    let dx = Math.abs(event.clientX - data.pressX);
    let dy = Math.abs(event.clientY - data.pressY);
    if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
      return;
    }

    this._startDrag(event.clientX, event.clientY);
  }

  /**
   * Start a drag event.
   */
  private _startDrag(clientX: number, clientY: number): void {
    let dragImage = document.createElement('div');
    dragImage.textContent = 'Dragging...';

    // Set up the drag event.
    this._drag = new Drag({
      mimeData: new MimeData(),
      dragImage,
      supportedActions: 'copy',
      source: this
    });

    this._drag.mimeData.setData('application/vnd.phosphor.widget-factory', () => {
      let p = this._newWidget();
      p.title.closable = true;
      return p;
    });

    // Remove mousemove and mouseup listeners and start the drag.
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);
    this._drag.start(clientX, clientY).then(action => {
      if (this.isDisposed) {
        return;
      }
      this._drag = null;
    });

  }

  private _newWidget: () => Widget = null;
  private _dragData: { pressX: number, pressY: number } = null;
  private _drag: Drag = null;
}

export
namespace DragHandle {
  export
  interface IOptions {
    newWidget: () => Widget;
  }
}
