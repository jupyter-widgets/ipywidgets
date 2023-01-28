// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/*
 This file contains substantial portions of https://github.com/akre54/Backbone.NativeView/blob/521188d9554b53d95d70ed34f878d8ac9fc10df2/backbone.nativeview.js, which has the following license:

(c) 2015 Adam Krebs, Jimmy Yuen Ho Wong
Backbone.NativeView may be freely distributed under the MIT license.

Copyright (c) 2014 Adam Krebs

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

import * as Backbone from 'backbone';

// Caches a local reference to `Element.prototype` for faster access.
const ElementProto: any =
  typeof Element !== 'undefined' ? Element.prototype : undefined;

// Find the right `Element#matches` for IE>=9 and modern browsers.
function matchesFallback(selector: string): boolean {
  const matches = (this.document || this.ownerDocument).querySelectorAll(
    selector
  );
  let i = matches.length;
  while (--i >= 0 && matches.item(i) !== this) {
    continue;
  }
  return i > -1;
}

const matchesSelector = ElementProto
  ? ElementProto.matches ||
    ElementProto['webkitMatchesSelector'] ||
    ElementProto['mozMatchesSelector'] ||
    ElementProto['msMatchesSelector'] ||
    ElementProto['oMatchesSelector'] ||
    matchesFallback
  : matchesFallback;

interface IDOMEvent {
  eventName: string;
  handler: any;
  listener: any;
  selector: string;
}

export class NativeView<T extends Backbone.Model> extends Backbone.View<T> {
  _removeElement(): void {
    this.undelegateEvents();
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }

  // Apply the `element` to the view.
  _setElement(element: HTMLElement): void {
    this.el = element;
  }

  // Set a hash of attributes to the view's `el`. We use the "prop" version
  // if available, falling back to `setAttribute` for the catch-all.
  _setAttributes(attrs: Backbone.ObjectHash): void {
    for (const attr in attrs) {
      attr in this.el
        ? ((this.el as any)[attr] = attrs[attr])
        : this.el.setAttribute(attr, attrs[attr]);
    }
  }

  /**
   * Make an event delegation handler for the given `eventName` and `selector`
   * and attach it to `this.el`.
   * If selector is empty, the listener will be bound to `this.el`. If not, a
   * new handler that will recursively traverse up the event target's DOM
   * hierarchy looking for a node that matches the selector. If one is found,
   * the event's `delegateTarget` property is set to it and the return the
   * result of calling bound `listener` with the parameters given to the
   * handler.
   *
   * This does not properly handle selectors for things like focus and blur (see
   * https://github.com/jquery/jquery/blob/7d21f02b9ec9f655583e898350badf89165ed4d5/src/event.js#L442
   * for some similar exceptional cases).
   */
  delegate(eventName: string, listener: Function): this;
  delegate(eventName: string, selector: string, listener: Function): this;
  delegate(
    eventName: string,
    selector: string | Function,
    listener?: any
  ): this {
    if (typeof selector !== 'string') {
      listener = selector;
      selector = null!;
    }

    // We have to initialize this here, instead of in the constructor, because the
    // super constructor eventually calls this method before we get a chance to initialize
    // this._domEvents to an empty list.
    if (this._domEvents === void 0) {
      this._domEvents = [];
    }

    const root = this.el;
    const handler = selector
      ? function (e: Event): any {
          let node = (e.target as HTMLElement) || (e.srcElement as HTMLElement);
          for (; node && node !== root; node = node.parentNode as HTMLElement) {
            if (matchesSelector.call(node, selector)) {
              (e as any).delegateTarget = node;
              if (listener.handleEvent) {
                return listener.handleEvent(e);
              } else {
                return listener(e);
              }
            }
          }
        }
      : listener;

    this.el.addEventListener(eventName, handler, false);
    this._domEvents.push({ eventName, handler, listener, selector });
    return handler;
  }

  // Remove a single delegated event. Either `eventName` or `selector` must
  // be included, `selector` and `listener` are optional.
  undelegate(eventName: string, selector?: string, listener?: Function): this;
  undelegate(selector: string, listener?: Function): this;
  undelegate(
    eventName: string,
    selector?: string | Function,
    listener?: Function
  ): NativeView<T> {
    if (typeof selector === 'function') {
      listener = selector;
      selector = null!;
    }

    if (this.el && this._domEvents) {
      const handlers = this._domEvents.slice();
      let i = handlers.length;
      while (i--) {
        const item = handlers[i];

        const match =
          item.eventName === eventName &&
          (listener ? item.listener === listener : true) &&
          (selector ? item.selector === selector : true);

        if (!match) {
          continue;
        }

        this.el.removeEventListener(item.eventName, item.handler, false);
        this._domEvents.splice(i, 1);
      }
    }
    return this;
  }

  // Remove all events created with `delegate` from `el`
  undelegateEvents(): this {
    if (this.el && this._domEvents) {
      const len = this._domEvents.length;
      for (let i = 0; i < len; i++) {
        const item = this._domEvents[i];
        this.el.removeEventListener(item.eventName, item.handler, false);
      }
      this._domEvents.length = 0;
    }
    return this;
  }

  private _domEvents: IDOMEvent[];
}
