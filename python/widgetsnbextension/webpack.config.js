var path = require('path');
module.exports = {
  entry: './src/extension.js',
  output: {
    filename: 'extension.js',
    path: path.resolve(__dirname, 'widgetsnbextension', 'static'),
    libraryTarget: 'amd',
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // required to load font-awesome
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.svg$/i, type: 'asset' },
    ],
  },
};
