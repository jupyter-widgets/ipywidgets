var path = require('path');

module.exports = {
    entry: './lib/index.js',
    output: {
        filename: 'index.built.js',
        path: path.resolve(__dirname, 'built'),
        publicPath: 'built/'
    },
    module: {
        rules: [
            { test: /\.css$/, use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('postcss-import'),
                            require('postcss-cssnext')
                        ]
                    }
                }
            ]},
            // jquery-ui loads some images
            { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
            // required to load font-awesome
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
              ]
    },
};
