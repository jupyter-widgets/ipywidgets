module.exports = {
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, loader: "file" },
    ]
  },
}
