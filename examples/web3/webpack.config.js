const postcss = require('postcss');
var path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './lib/index.js',
  output: {
    filename: 'index.built.js',
    path: path.resolve(__dirname, 'built'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  postcss.plugin('delete-tilde', function () {
                    return function (css) {
                      css.walkAtRules('import', function (rule) {
                        rule.params = rule.params.replace('~', '');
                      });
                    };
                  }),
                  postcss.plugin('prepend', function () {
                    return function (css) {
                      css.prepend(
                        "@import '@jupyter-widgets/controls/css/labvariables.css';"
                      );
                    };
                  }),
                  require('postcss-import')(),
                  require('postcss-cssnext')(),
                ],
              },
            },
          },
        ],
      },
      // required to load font-awesome
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.svg$/i, type: 'asset' },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // Needed for Blueprint. See https://github.com/palantir/blueprint/issues/4393
      'process.env': '{}',
    }),
  ],
};
