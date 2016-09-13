// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var path = require('path');

var buildExtension = require('jupyterlab-extension-builder').buildExtension;

buildExtension({
  name: 'widgetslabextension',
  entryPath: './lib/plugin.js',
  extractCSS: true,
  config: {
      output: {
        path: path.join(process.cwd(), 'widgetslabextension', 'static'),
    }
  }
});
