// This file contains a modified version of the set function from the Backbone
// (see
// https://github.com/jashkenas/backbone/blob/05fde9e201f7e2137796663081105cd6dad12a98/backbone.js#L460,
// with changes below marked with an EDIT comment). This file in Backbone has the following license.

//     (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

// Backbone's full license is below (from https://github.com/jashkenas/backbone/blob/05fde9e201f7e2137796663081105cd6dad12a98/LICENSE)

/*
Copyright (c) 2010-2015 Jeremy Ashkenas, DocumentCloud

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

import * as utils from './utils';

import { ModelSetOptions, ObjectHash } from 'backbone';

import { JSONExt } from '@lumino/coreutils';

// Set a hash of model attributes on the object, firing `"change"`. This is
// the core primitive operation of a model, updating the data and notifying
// anyone who needs to know about the change in state. The heart of the beast.
// This *MUST* be called with the model as the `this` context.
export function set(
  key: string | {},
  val: any,
  options: ModelSetOptions & { unset?: boolean }
): any {
  if (key == null) {
    return this;
  }

  // Handle both `"key", value` and `{key: value}` -style arguments.
  let attrs: ObjectHash;
  if (JSONExt.isObject(key)) {
    attrs = key;
    options = val;
  } else {
    (attrs = {} as ObjectHash)[key] = val;
  }

  options || (options = {});

  // Run validation.
  if (!this._validate(attrs, options)) {
    return false;
  }

  // Extract attributes and options.
  const unset = options.unset;
  const silent = options.silent;
  const changes = [];
  const changing = this._changing;
  this._changing = true;
  try {
    if (!changing) {
      // EDIT: changed to use object spread instead of _.clone
      this._previousAttributes = { ...this.attributes };
      this.changed = {};
    }

    const current = this.attributes;
    const changed = this.changed;
    const prev = this._previousAttributes;

    // For each `set` attribute, update or delete the current value.
    for (const attr in attrs) {
      val = attrs[attr];
      // EDIT: the following two lines use our isEqual instead of _.isEqual
      if (!utils.isEqual(current[attr], val)) {
        changes.push(attr);
      }
      if (!utils.isEqual(prev[attr], val)) {
        changed[attr] = val;
      } else {
        delete changed[attr];
      }
      unset ? delete current[attr] : (current[attr] = val);
    }

    // Update the `id`.
    this.id = this.get(this.idAttribute);

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) {
        this._pending = options;
      }
      for (let i = 0; i < changes.length; i++) {
        this.trigger(
          'change:' + changes[i],
          this,
          current[changes[i]],
          options
        );
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (changing) {
      return this;
    }
    if (!silent) {
      while (this._pending) {
        options = this._pending;
        this._pending = false;
        this.trigger('change', this, options);
      }
    }
  } finally {
    this._pending = false;
    this._changing = false;
  }
  return this;
}
