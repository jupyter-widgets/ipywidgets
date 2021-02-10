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
      { test: /\.md$/, loader: 'raw-loader' },
      { test: /\.html$/, loader: 'file', options: { name: '[name].[ext]' } },
      { test: /\.ipynb$/, loader: 'json-loader' }
    ]
  },
  mode: 'development'
};
