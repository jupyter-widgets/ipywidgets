var path = require('path');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'index.built.js',
    path: path.resolve(__dirname, 'built'),
    publicPath: 'built/'
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' }
    ]
  }
};
