module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
      // jquery-ui loads some images
      { test: /\.(jpg|png|gif)$/, loader: "file" },
      // required to load font-awesome
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
    ]
  },
  entry: './source/_static/index.js',
  output: {
    filename: 'index.js',
    path: './source/_static/built/',
    publicPath: "./_static/built/"
  },
  devtool: 'source-map',
};
