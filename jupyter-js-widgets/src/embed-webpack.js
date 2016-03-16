
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// This file must be webpacked because it contains .css imports

// Load jquery and jquery-ui
var $ = require('jquery');
require('jquery-ui');
$.getQueryParameters = window.$.getQueryParameters;
$.urldecode = window.$.urldecode;
window.$ = window.jQuery = $;

// Load styling
require('jquery-ui/themes/smoothness/jquery-ui.min.css');
require("../css/widgets.min.css");

const widgets = require('./index');
console.info('jupyter-js-widgets loaded successfully');

const manager = widgets.EmbedManager();

// Magic global widget rendering function:
window.w = function renderWidgetState(widgetStateObject) {

  // Create the container div and insert it into the DOM immediately above the
  // current script tag.
  console.info('Inserting widget(s)...');
  var container = document.createElement('div');
  container.innerHTML = `
    <div class="widget-loading">
      <span class="glyphicon glyphicon-hourglass glyphicon-spin" aria-hidden="true"></span>
    </div>
  `;

  // Assume that the current script tag is the last script tag, because the
  // script tags are processed immediately as the browser traverses through the
  // DOM.
  var context = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0];
  context.parentElement.insertBefore(container, context);

  // Create and render the widget, replacing the loading view.
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'widget-area';
  manager.display_widget_state(widgetStateObject, widgetContainer).then(() => {
    container.innerHTML = '';
    container.appendChild(widgetContainer);
  });
};
