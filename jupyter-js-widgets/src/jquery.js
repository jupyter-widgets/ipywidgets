// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// TODO: REMOVE ALL JQUERY FROM THE CODEBASE
var $;
if (typeof window !== 'undefined' && window['$']) {
    $ = window['$'];
} else {
    $ = require("jquery");
    global.jQuery = $; // Required for bootstrap to load correctly

    require("jquery-ui");
    require("bootstrap");
}
module.exports = $;
