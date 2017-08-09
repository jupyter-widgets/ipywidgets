// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const version = (require('../package.json') as any).version;

import 'font-awesome/css/font-awesome.css';
import '@phosphor/widgets/style/index.css';
import '@jupyter-widgets/controls/css/widgets.built.css';

// WidgetModel is *just* used as a typing below
import {
    WidgetModel
} from '@jupyter-widgets/base';

/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
let requirePromise = function(pkg: string | string[]) {
    return new Promise((resolve, reject) => {
        let require = (window as any).require;
        if (require === undefined) {
            reject("Requirejs is needed to run the Jupyter Widgets html manager");
        } else {
            require(pkg, resolve, reject);
        }
    });
}

// Element.prototype.matches polyfill for IE
// See https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

// Load json schema validator
var Ajv = require('ajv');
var widget_state_schema = require('@jupyter-widgets/schema').v2.state;
var widget_view_schema = require('@jupyter-widgets/schema').v2.view;

let ajv = new Ajv()
let model_validate = ajv.compile(widget_state_schema);
let view_validate = ajv.compile(widget_view_schema);

export
function loadManager() {
    let toLoad = ['base.js', 'controls.js', 'index.js'];
    return requirePromise(toLoad.map(f => `https://unpkg.com/@jupyter-widgets/html-manager@${version}/dist/${f}`));
};

// `LoadInlineWidget` is the main function called on load of the web page. All
// it does is ensure requirejs is on the page and call `renderInlineWidgets`
function loadInlineWidgets(event) {
    loadManager().then(() => {
        renderInlineWidgets(event);
    });
}

// `renderInlineWidget` will call `renderManager(element, tag)` on each <script>
// tag of mime type
//     "application/vnd.jupyter.widget-state+json"
// contained in `event.element`.
export function renderInlineWidgets(event) {
    let element = event.target || document;
    let tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-state+json"]');
    for (let i=0; i!=tags.length; ++i) {
        renderManager(element, tags[i]);
    }
}

// Function `renderManager(element, tag)` creates a widget embed manager for the
// specified <script> tag (which must have mime type)
//     "application/vnd.jupyter.widget-state+json".
// Then it performs a look up of all script tags under the specified DOM
// element with the mime type
//     "application/vnd.jupyter.widget-view+json".
// For each one of these <script> tags, if the contained json specifies a model id
// known to the aforementioned manager, it is replaced with a view of the model.
//
// Besides, if the view script tag has an <img> sibling DOM node with class `jupyter-widget`,
// the <img> tag is deleted.
function renderManager(element, tag) {
    (window as any).require(['@jupyter-widgets/html-manager'], (htmlmanager) => {
        let widgetStateObject = JSON.parse(tag.innerHTML);
        let valid = model_validate(widgetStateObject);
        if (!valid) {
            console.log(model_validate.errors);
        }
        let manager = new htmlmanager.HTMLManager();
        manager.set_state(widgetStateObject).then(function(models) {
            let tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-view+json"]');
            for (let i=0; i!=tags.length; ++i) {
                // TODO: validate view schema
                let viewtag = tags[i];
                let widgetViewObject = JSON.parse(viewtag.innerHTML);
                let valid = view_validate(widgetViewObject);
                if (!valid) {
                    console.error('View state has errors.', view_validate.errors);
                }
                let model_id = widgetViewObject.model_id;
                // should use .find, but IE doesn't support .find
                let model = models.filter( (item : WidgetModel) => {
                    return item.model_id == model_id;
                })[0];
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
    });
}

// Prevent the embedder to be defined twice.
if (!(window as any)._jupyter_widget_embedder) {
    (window as any)._jupyter_widget_embedder = true;
    window.addEventListener('load', loadInlineWidgets);
}
