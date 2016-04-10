
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// This file must be webpacked because it contains .css imports

// Load jquery and jquery-ui
var $ = require('jquery');
require('jquery-ui');
window.$ = window.jQuery = $;
require('jquery-ui');

// Load styling
require('jquery-ui/themes/smoothness/jquery-ui.min.css');
require('../css/widgets.min.css');

// Define jupyter-js-widget requirejs module
// This is needed for custom widget model to be able to require
// jupyter-js-widgets.
var widgets = require('./index');

if (window.define) {
    window.define('jupyter-js-widgets', function() {
        return widgets;
    });
}

// Magic global widget rendering function:
var manager = new widgets.EmbedManager();

function renderInlineWidgets(event) {
  var element = event.target || document;
  var tags = element.querySelectorAll('script[type="application/vnd.jupyter-embedded-widgets"]');
  for (var i=0; i!=tags.length; ++i) {
    var tag = tags[i];
    var widgetStateObject = JSON.parse(tag.innerHTML);
    var widgetContainer = document.createElement('div');
    widgetContainer.className = 'widget-area';
    manager.display_widget_state(widgetStateObject, widgetContainer).then(function() {
        if (tag.previousElementSibling &&
            tag.previousElementSibling.matches('img.jupyter-widget')) {
            tag.parentElement.removeChild(tag.previousElementSibling);
        }
        tag.parentElement.insertBefore(widgetContainer, tag);
    });
  }
}

window.addEventListener('load', renderInlineWidgets);

// Module exports
module.exports = {
    manager: manager,
    renderInlineWidgets: renderInlineWidgets
}
