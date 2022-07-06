var path = require('path');

module.exports = {
  entry: './test/build/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'coverage.js',
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, type: 'asset/source' },
      {
        test: /\.html$/,
        type: 'asset/resource',
        generator: { filename: '[name].[ext]' },
      },
      { test: /\.ipynb$/, type: 'json' },
    ],
    preLoaders: [
      // instrument only testing sources with Istanbul
      {
        test: /\.js$/,
        include: path.resolve('lib/'),
        loader: 'istanbul-instrumenter',
      },
    ],
  },
};
