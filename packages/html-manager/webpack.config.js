// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var version = require('./package.json').version;

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

var loaders = [
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
        ];

var publicPath = 'https://unpkg.com/@jupyter-widgets/html-manager@' + version + '/dist/';

module.exports = [
{// shim
    entry: './lib/embed-webpack.js',
    output: {
        filename : 'embed.js',
        path: './dist',
        publicPath: publicPath,
    },
    devtool: 'source-map',
    module: { loaders: loaders },
    postcss: postcssHandler,
},
{// @jupyter-widgets/html-manager
    entry: './lib/index.js',
    output: {
        library: '@jupyter-widgets/html-manager',
        filename : 'index.js',
        path: './dist',
        publicPath: publicPath,
        libraryTarget: 'amd',
    },
    devtool: 'source-map',
    module: { loaders: loaders },
    postcss: postcssHandler,
    externals: ['@jupyter-widgets/base', '@jupyter-widgets/controls']
},
{// @jupyter-widgets/base
    entry: '@jupyter-widgets/base/lib/index',
    output: {
        library: '@jupyter-widgets/base',
        filename : 'base.js',
        path: './dist',
        publicPath: publicPath,
        libraryTarget: 'amd',
    },
    devtool: 'source-map',
    module: { loaders: loaders },
    postcss: postcssHandler
},
{// @jupyter-widgets/controls
    entry: '@jupyter-widgets/controls/lib/index',
    output: {
        library: '@jupyter-widgets/controls',
        filename : 'controls.js',
        path: './dist',
        publicPath: publicPath,
        libraryTarget: 'amd'
    },
    devtool: 'source-map',
    module: { loaders: loaders },
    postcss: postcssHandler,
    externals: ['@jupyter-widgets/base']
}
];
