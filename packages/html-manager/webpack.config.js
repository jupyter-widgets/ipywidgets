// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Here we generate the /dist files that allow widget embedding

var path = require('path');
var webpack = require('webpack');

var version = require('./package.json').version;

var rules = [
  { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  // jquery-ui loads some images
  { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
  // required to load font-awesome
  {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/font-woff',
      },
    },
  },
  {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/font-woff',
      },
    },
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/octet-stream',
      },
    },
  },
  { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'image/svg+xml',
      },
    },
  },
];

var plugins = [
  new webpack.DefinePlugin({
    // Needed for Blueprint. See https://github.com/palantir/blueprint/issues/4393
    'process.env': '{}',
  }),
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
    plugins: plugins,
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
    plugins: plugins,
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
    plugins: plugins,
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
    plugins: plugins,
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
    plugins: plugins,
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
    plugins: plugins,
  },
];
