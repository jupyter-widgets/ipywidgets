module.exports = {
  entry: './index.js',
  output: {
      filename: 'index.built.js',
      path: './built/',
      publicPath: 'built/'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, loader: "file" },
    ]
  },
}
