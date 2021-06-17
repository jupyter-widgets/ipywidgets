var path = require('path');

module.exports = {
  entry: './test/build/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
    publicPath: './build/'
  },
  bail: true,
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, use: 'raw-loader' },
      { test: /\.html$/, use: {loader: 'file-loader', options: { name: '[name].[ext]' } } },
      { test: /\.ipynb$/, use: 'json-loader' }
    ]
  },
  mode: 'development',
  resolve: {fallback: { util: false } }
};
