var path = require('path');
var postcss = require('postcss');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './test/build/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  bail: true,
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
};
