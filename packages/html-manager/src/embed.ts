// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import 'font-awesome/css/font-awesome.css';
import '@phosphor/widgets/style/index.css';
import '@jupyter-widgets/controls/css/widgets.built.css';

// WidgetModel is *just* used as a typing below
import {
    WidgetModel
} from '@jupyter-widgets/base';

// Populate the requirejs cache with local versions of @jupyter-widgets/base,
// @jupyter-widgets/controls, @jupyter-widgets/html-manager
require('./base');
require('./controls');
require('./index');

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

/**
 * Render the inline widgets inside a DOM element.
 *
 * @param element (default document.documentElement) The document element in which to process for widget state.
 */
export
function renderInlineWidgets(element: HTMLElement = document.documentElement) {
    let tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-state+json"]');
    for (let i=0; i!=tags.length; ++i) {
        renderManager(element, JSON.parse(tags[i].innerHTML));
    }
}

/**
 * Create a widget manager for a given widget state.
 *
 * @param element The DOM element to search for widget view state script tags
 * @param widgetState The widget manager state
 *
 * #### Notes
 *
 * Widget view state should be in script tags with type
 * "application/vnd.jupyter.widget-view+json". Any such script tag containing a
 * model id the manager knows about is replaced with a rendered view.
 * Additionally, if the script tag has a prior img sibling with class
 * 'jupyter-widget', then that img tag is deleted.
 */
function renderManager(element, widgetState) {
    (window as any).require(['@jupyter-widgets/html-manager'], (htmlmanager) => {
        let valid = model_validate(widgetState);
        if (!valid) {
            console.error('Model state has errors.', model_validate.errors);
        }
        let manager = new htmlmanager.HTMLManager();
        manager.set_state(widgetState).then(function(models) {
            let tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-view+json"]');
            for (let i=0; i!=tags.length; ++i) {
                let viewtag = tags[i];
                let widgetViewObject = JSON.parse(viewtag.innerHTML);
                let valid = view_validate(widgetViewObject);
                if (!valid) {
                    console.error('View state has errors.', view_validate.errors);
                }
                let model_id = widgetViewObject.model_id;
                // Find the model id in the models. We should use .find, but IE
                // doesn't support .find
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

