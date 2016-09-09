// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var buildExtension = require('jupyterlab-extension-builder').buildExtension;

buildExtension({
  name: 'ipywidgets',
  entryPath: './lib/index.js',
});
