var postcss = require('postcss');

var postcssHandler = function() {
    return [
        postcss.plugin('delete-tilde', function() {
            return function (css) {
                css.walkAtRules('import', function(rule) {
                    rule.params = rule.params.replace('~', '');
                });
            };
        }),
        postcss.plugin('prepend', function() {
            return function(css) {
                css.prepend("@import '@jupyter-widgets/controls/css/labvariables.css';")
            }
        }),
        require('postcss-import')(),
        require('postcss-cssnext')()
    ];
}


module.exports = {
    entry: './lib/index.js',
    output: {
        filename: 'index.built.js',
        path: './built/',
        publicPath: 'built/'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader!postcss-loader" },
            { test: /\.json$/, loader: "json-loader" },
            // jquery-ui loads some images
            { test: /\.(jpg|png|gif)$/, loader: "file" },
            // required to load font-awesome
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" }
        ]
    },
    postcss: postcssHandler,
};
