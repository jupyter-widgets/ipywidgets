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

// Load json schema validator
var Ajv = require('ajv');
var widget_state_schema = require('jupyter-widget-schema').v1.state;
var widget_view_schema = require('jupyter-widget-schema').v1.view;


// Magic global widget rendering function:
import * as widgets from './index';

// `LoadInlineWidget` is the main function called on load of the web page.
// All it does is inserting a <script> tag for requirejs in the case it is not
// available and call `renderInlineWidgets`
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

// `renderInlineWidget` will call `renderManager(element, tag)` on each <script>
// tag of mime type
//     "application/vnd.jupyter.widget-state+json"
// contained in `event.element`.
export function renderInlineWidgets(event) {
    var element = event.target || document;
    var tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-state+json"]');
    for (var i=0; i!=tags.length; ++i) {
        renderManager(element, tags[i]);
    }
}

// Function `renderManager(element, tag)` creates a widget embed manager for the
// specified <script> tag (which must have mime type)
//     "application/vnd.jupyter.widget-state+json".
// Then it performs a look up of all script tags under the specified DOM
// element with the mime type
//     "application/vnd.jupyter.widget-view+json".
// For each oone of these <script> tag, if the contained json specifies a model id
// known to the aforementioned manager, it is replaced with a view of the model.
//
// Besides, if the view script tag has an <img> sibling DOM node with class `jupyter-widget`,
// the <img> tag is deleted.
function renderManager(element, tag) {
    var widgetStateObject = JSON.parse(tag.innerHTML);
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var model_validate = ajv.compile(widget_state_schema);
    var valid = model_validate(widgetStateObject);
    if (!valid) {
        console.log(model_validate.errors);
    }
    var manager = new widgets.EmbedManager();
    manager.set_state(widgetStateObject.state, {}).then(function(models) {
        var tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-view+json"]');
        for (var i=0; i!=tags.length; ++i) {
            // TODO: validate view schema
            let viewtag = tags[i];
            let widgetViewObject = JSON.parse(viewtag.innerHTML);
            var view_validate = ajv.compile(widget_view_schema);
            var valid = view_validate(widgetViewObject);
            if (!valid) {
                console.log(view_validate.errors);
            }
            let model_id = widgetViewObject.model_id;
            let model = models.find(function(item) {
                return item.id == model_id;
            });
            if (model !== undefined) {
                if (viewtag.previousElementSibling &&
                    viewtag.previousElementSibling.matches('img.jupyter-widget')) {
                    viewtag.parentElement.removeChild(viewtag.previousElementSibling);
                }
                let widgetTag = document.createElement('div');
                widgetTag.className = 'widget-subarea';
                viewtag.parentElement.insertBefore(widgetTag, viewtag);
                manager.display_model(undefined, model, { el : widgetTag });
            }
        }
    });
}

window.addEventListener('load', loadInlineWidgets);
