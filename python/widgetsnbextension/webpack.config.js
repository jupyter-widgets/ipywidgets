var path = require('path');
module.exports = {
  entry: ['./amd-public-path.js', './src/extension.js'],
  output: {
    filename: 'extension.js',
    path: path.resolve(__dirname, 'widgetsnbextension', 'static'),
    libraryTarget: 'amd',
    publicPath: '', // Set in amd-public-path.js
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
  // 'module' is the magic requirejs dependency used to set the publicPath
  externals: ['module'],
};
