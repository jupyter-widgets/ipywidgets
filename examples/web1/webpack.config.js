var path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './index.js',
  output: {
    filename: 'index.built.js',
    path: path.resolve(__dirname, 'built'),
  },
  module: {
    rules: [{ test: /\.css$/i, use: ['style-loader', 'css-loader'] }],
  },
};
