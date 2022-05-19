var path = require('path');

module.exports = {
  entry: './test/build/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
  },
  bail: true,
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, type: 'asset/source' },
      {
        test: /\.html$/,
        type: 'asset/resource',
        generator: { filename: '[name].[ext]' },
      },
      { test: /\.ipynb$/, type: 'json' },
    ],
  },
  mode: 'development',
  resolve: { fallback: { util: false } },
};
