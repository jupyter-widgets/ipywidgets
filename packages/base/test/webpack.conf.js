const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: __dirname + "/build",
    filename: "bundle.js",
    publicPath: "./build/"
  },
  bail: true,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve("./test/tsconfig.json")
        }
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.md$/, loader: 'raw-loader'},
      { test: /\.html$/, loader: "file?name=[name].[ext]" },
      { test: /\.ipynb$/, loader: 'json-loader' }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  mode: 'development',
  devtool: 'inline-source-map',
}
