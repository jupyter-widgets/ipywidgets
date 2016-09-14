// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var helpers = require('jupyterlab/scripts/extension_helpers');
console.log('providing jupyter-js-widgets shim handler');
module.exports = helpers.createShimHandler('jupyter-js-widgets');
