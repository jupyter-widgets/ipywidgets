var path = require('path');

module.exports = {
  entry: './test/build/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'coverage.js'
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.ipynb$/, use: 'json-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, use: 'raw-loader' },
      {
        test: /\.html$/,
        use: { loader: 'file-loader', options: { name: '[name].[ext]' } },
      },
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
