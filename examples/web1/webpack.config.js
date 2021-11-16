var path = require('path');
var webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'index.built.js',
    path: path.resolve(__dirname, 'built'),
    publicPath: 'built/',
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // Needed for Blueprint. See https://github.com/palantir/blueprint/issues/4393
      'process.env': '{}',
      // Needed for various packages using cwd(), like the path polyfill
      'process.cwd': '() => "/"',
    }),
  ],
};
