// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var WidgetModel = require('./widget').WidgetModel;

/**
* Collection of patches on top of ipyWidgetModel
*/
var DeclWidgetModel = WidgetModel.extend({
  constructor: function() {
    WidgetModel.apply(this, arguments);
    // WidgetModel expects widgets' state to be set from kernel and won't
    // set `_first_state` to false until that happens. But DeclWidgets
    // are different: we do initial setup on client and then notify kernel.
    this._first_state = false;
  },

  /*
   * Making request_state a noop to avoid requiring this handshake to take place to
   * create model.
   */
  request_state: function(callbacks) {
    console.trace( "Empty implementation of request_state()");
    return Promise.resolve(this);
  },

  /*
   * Avoiding out of sequence messages due to new promise/async code in WidgetModel
   */
  send_sync_message: function(attrs, callbacks) {
    var data = {method: 'backbone', sync_data: attrs};
    this.comm.send(data, callbacks);
  }
});

module.exports = {
  DeclWidgetModel: DeclWidgetModel
};
