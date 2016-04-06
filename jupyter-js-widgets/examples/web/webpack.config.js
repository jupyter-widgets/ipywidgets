module.exports = {
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, loader: "file" },
    ]
  },
}
