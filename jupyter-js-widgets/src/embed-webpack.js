
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

const widgets = require('./index');
console.info('jupyter-js-widgets loaded successfully');

const manager = new widgets.EmbedManager();

// Magic global widget rendering function:
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

// Module exports
exports.manager = manager;
exports.renderInlineWidgets = renderInlineWidgets;

// Set window globals
window.manager = manager;

window.addEventListener('load', renderInlineWidgets);
