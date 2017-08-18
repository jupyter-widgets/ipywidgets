var path = require('path');

module.exports = {
  entry: './index.js',
  output: {
      filename: 'index.built.js',
      path: path.resolve(__dirname, 'built'),
      publicPath: 'built/'
  },
  module: {
    rules: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
    ]
  },
}
