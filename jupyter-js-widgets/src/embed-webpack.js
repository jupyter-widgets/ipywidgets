
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Load jquery and jquery-ui
var $ = require('jquery');
window.$ = window.jQuery = $;
require('jquery-ui');

// Load styling
require('jquery-ui/themes/smoothness/jquery-ui.min.css');
require('font-awesome/css/font-awesome.css');
require('../css/widgets.min.css');

// Magic global widget rendering function:
var widgets = require('./index');
var manager = new widgets.EmbedManager();

function loadInlineWidgets(event) {
    // If requirejs is not on the page on page load, load it from cdn.
    if (!window.requirejs) {
        var scriptjs = require('scriptjs');
        scriptjs('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/require.min.js', function() {
            renderInlineWidgets(event);
        });
    } else {
        renderInlineWidgets(event);
    }
}

function renderInlineWidgets(event) {
  // Define jupyter-js-widget requirejs module
  // This is needed for custom widget model to be able to require
  // jupyter-js-widgets.
  window.define('jupyter-js-widgets', function() {
      return widgets;
  });

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

window.addEventListener('load', loadInlineWidgets);

// Module exports
module.exports = {
    manager: manager,
    renderInlineWidgets: renderInlineWidgets
}
