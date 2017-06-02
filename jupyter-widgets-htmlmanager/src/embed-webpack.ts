// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// ES6 Promise polyfill
(require('es6-promise') as any).polyfill();

import 'font-awesome/css/font-awesome.css';
import '@phosphor/widgets/style/index.css';
import '@jupyter-widgets/controls/css/widgets.built.css';


// Element.prototype.matches polyfill
if (Element && !Element.prototype.matches) {
    let proto = Element.prototype as any;
    proto.matches = proto.matchesSelector ||
    proto.mozMatchesSelector || proto.msMatchesSelector ||
    proto.oMatchesSelector || proto.webkitMatchesSelector;
}

import {
    HTMLManager
} from './htmlmanager';

import {
    WidgetModel
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

// Load json schema validator
var Ajv = require('ajv');
var widget_state_schema = require('jupyter-widgets-schema').v2.state;
var widget_view_schema = require('jupyter-widgets-schema').v2.view;

// BEGIN: Ajv config for json-schema draft 4, from https://github.com/epoberezkin/ajv/releases/tag/5.0.0
// This can be deleted when the schema is moved to draft 6
var ajv = new Ajv({
  meta: false, // optional, to prevent adding draft-06 meta-schema
  extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
  unknownFormats: 'ignore',  // optional, current default is true (fail)
  // ...
});

var metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
ajv.addMetaSchema(metaSchema);
ajv._opts.defaultMeta = metaSchema.id;

// optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

// Optionally you can also disable keywords defined in draft-06
ajv.removeKeyword('propertyNames');
ajv.removeKeyword('contains');
ajv.removeKeyword('const');
// END: Ajv config for json-schema draft 4, from https://github.com/epoberezkin/ajv/releases/tag/5.0.0

let model_validate = ajv.compile(widget_state_schema);
let view_validate = ajv.compile(widget_view_schema);


// `LoadInlineWidget` is the main function called on load of the web page.
// All it does is inserting a <script> tag for requirejs in the case it is not
// available and call `renderInlineWidgets`
function loadInlineWidgets(event) {
    let loadRequire = new Promise(function(resolve, reject) {
        if ((window as any).requirejs) {
            resolve();
        } else {
            // If requirejs is not on the page on page load, load it from cdn.
            let scriptjs = require('scriptjs') as any;
            scriptjs('https://unpkg.com/requirejs/require.js', function() {
                resolve();
            });
        }
    });
    loadRequire.then(function() {
        // Render inline widgets
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
    let widgetStateObject = JSON.parse(tag.innerHTML);
    let valid = model_validate(widgetStateObject);
    if (!valid) {
        console.log(model_validate.errors);
    }
    let manager = new HTMLManager();
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
            let model = _.find(models, function(item : WidgetModel) {
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

// Prevent the embedder to be defined twice.
if (!(window as any)._jupyter_widget_embedder) {
    (window as any)._jupyter_widget_embedder = true;
    window.addEventListener('load', loadInlineWidgets);
}
