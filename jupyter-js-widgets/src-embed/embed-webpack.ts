// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// ES6 Promise polyfill
(require('es6-promise') as any).polyfill();

// Element.prototype.matches polyfill
if (Element && !Element.prototype.matches) {
    var proto = Element.prototype as any;
    proto.matches = proto.matchesSelector ||
    proto.mozMatchesSelector || proto.msMatchesSelector ||
    proto.oMatchesSelector || proto.webkitMatchesSelector;
}

// Load styling
require('font-awesome/css/font-awesome.css');
require('../css/widgets.built.css');

// Magic global widget rendering function:
import * as widgets from './index';

function loadInlineWidgets(event) {
    // If requirejs is not on the page on page load, load it from cdn.
    if (!(window as any).requirejs) {
        var scriptjs = require('scriptjs') as any;
        scriptjs('https://unpkg.com/requirejs/require.js', function() {
            // Define jupyter-js-widget requirejs module
            //
            // (This is needed for custom widget model to be able to AMD require jupyter-js-widgets.)
            (window as any).define('jupyter-js-widgets', function() {
                return widgets;
            });
            // Render inline widgets
            renderInlineWidgets(event);
        });
    } else {
        // Render inline widgets
        renderInlineWidgets(event);
    }
}

export
function renderInlineWidgets(event) {
    var element = event.target || document;
    var tags = element.querySelectorAll('script[type="application/vnd.jupyter-embedded-widgets"]');
    for (var i=0; i!=tags.length; ++i) {
        replaceTag(tags[i]);
    }
}

function replaceTag(tag) {
    var widgetStateObject = JSON.parse(tag.innerHTML);
    var widgetContainer = document.createElement('div');
    widgetContainer.className = 'widget-subarea';
    var manager = new widgets.EmbedManager();
    manager.display_widget_state(widgetStateObject, widgetContainer).then(function() {
        if (tag.previousElementSibling &&
            tag.previousElementSibling.matches('img.jupyter-widget')) {
            tag.parentElement.removeChild(tag.previousElementSibling);
        }
        tag.parentElement.insertBefore(widgetContainer, tag);
    });
}

window.addEventListener('load', loadInlineWidgets);
