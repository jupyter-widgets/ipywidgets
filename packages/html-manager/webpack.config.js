// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Here we generate the /dist files that allow widget embedding

var path = require('path');

var rules = [
  { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  // required to load font-awesome
  { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
  { test: /\.svg$/i, type: 'asset' },
];

module.exports = [
  {
    // script that renders widgets using the standard embedding and can only render standard controls
    entry: './lib/embed.js',
    output: {
      filename: 'embed.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    module: { rules: rules },
    mode: 'production',
  },
  {
    // script that renders widgets using the amd embedding and can render third-party custom widgets
    entry: './lib/embed-amd-render.js',
    output: {
      filename: 'embed-amd-render.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
    },
    module: { rules: rules },
    mode: 'production',
  },
  {
    // embed library that depends on requirejs, and can load third-party widgets dynamically
    entry: './lib/libembed-amd.js',
    output: {
      library: '@jupyter-widgets/html-manager/dist/libembed-amd',
      filename: 'libembed-amd.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
    },
    module: { rules: rules },
    mode: 'production',
  },
  {
    // @jupyter-widgets/html-manager
    entry: './lib/index.js',
    output: {
      library: '@jupyter-widgets/html-manager',
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
    },
    module: { rules: rules },
    externals: ['@jupyter-widgets/base', '@jupyter-widgets/controls'],
    mode: 'production',
  },
  {
    // @jupyter-widgets/base
    entry: '@jupyter-widgets/base/lib/index',
    output: {
      library: '@jupyter-widgets/base',
      filename: 'base.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
    },
    module: { rules: rules },
    mode: 'production',
  },
  {
    // @jupyter-widgets/controls
    entry: '@jupyter-widgets/controls/lib/index',
    output: {
      library: '@jupyter-widgets/controls',
      filename: 'controls.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
    },
    module: { rules: rules },
    externals: ['@jupyter-widgets/base'],
    mode: 'production',
  },
];
