// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils= require('./utils');
var _ = require('underscore');


/**
 * From https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
var promisifiedOldGUM = function(constraints) {

  // First get ahold of getUserMedia, if present
  var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if(!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function(resolve, reject) {
    getUserMedia.call(navigator, constraints, resolve, reject);
  });
		
}

// Older browsers might not implement mediaDevices at all, so we set an empty object first. From https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
if(navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing. From https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
if(navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}


var MediaModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'MediaModel',
        _view_name: 'MediaView',
        audio: false,
        video: true
    }),
    initialize: function() {
        // Get the camera permissions
        this.stream = navigator.mediaDevices.getUserMedia({audio: false, video: true});
    }
});

var MediaView = widget.DOMWidgetView.extend({

    initialize: function() {
        this.setElement(document.createElement('video'));
        MediaView.__super__.initialize.apply(this, arguments);
    },
    
    render: function() {
        var that = this;
        that.model.stream.then(function(stream) {
            that.el.src = window.URL.createObjectURL(stream);
        })
    }

});

module.exports = {
    MediaModel: MediaModel,
    MediaView: MediaView
};
