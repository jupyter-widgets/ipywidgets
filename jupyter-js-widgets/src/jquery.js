// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// TODO: REMOVE ALL JQUERY FROM THE CODEBASE
// Update March 2016: JQuery removed from most widgets, only
// still used in slider (jquery-ui) in widget_int.js.

var $;
if (typeof window !== 'undefined' && window['$']) {
    $ = window['$'];
} else {
    $ = require('jquery');
    global.jQuery = $; // Required for bootstrap to load correctly
}
module.exports = $;
