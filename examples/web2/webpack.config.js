var path = require('path');
var webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './index.js',
  output: {
    filename: 'index.built.js',
    path: path.resolve(__dirname, 'built'),
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.py$/i, type: 'asset/source' },
      // required to load font-awesome
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.svg$/i, type: 'asset' },
    ],
  },
};
