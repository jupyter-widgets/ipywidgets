var path = require('path');
var postcss = require('postcss');

module.exports = {
    entry: './test/build/index.js',
    output: {
        path: __dirname + "/build",
        filename: "bundle.js",
        publicPath: "./build/"
    },
    bail: true,
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
            { test: /\.md$/, loader: 'raw-loader'},
            { test: /\.html$/, loader: "file?name=[name].[ext]" },
            { test: /\.ipynb$/, loader: 'json-loader' },
            { test: /\.json$/, loader: 'json-loader' },
        ],
    },
    postcss: () => {
        return [
            postcss.plugin('delete-tilde', () => {
                return function (css) {
                    css.walkAtRules('import', (rule) => {
                        rule.params = rule.params.replace('~', '');
                    });
                };
            }),
            postcss.plugin('prepend', () => {
                return (css) => {
                    css.prepend(`@import '@jupyter-widgets/controls/css/labvariables.css';`)
                }
            }),
            require('postcss-import')(),
            require('postcss-cssnext')()
        ];
    }
}
