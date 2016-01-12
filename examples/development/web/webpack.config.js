module.exports = {
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(jpg|png|gif)$/, loader: "file" },
    ]
  },
  externals: {
      "base/js/namespace": "base/js/namespace",
      "notebook/js/outputarea": "notebook/js/outputarea",
      "services/kernels/comm": "services/kernels/comm"
  }
}
