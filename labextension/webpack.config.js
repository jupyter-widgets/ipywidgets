var version = require('./package.json').version;

module.exports = {
    entry: './lib',
    output: {
        filename: 'index.js',
        path: './dist',
        library: 'jupyter-js-widgets-labextension',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        publicPath: 'https://npmcdn.com/jupyter-js-widgets-labextension@' + version + '/dist/'
    },
    bail: true,
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.json$/, loader: "json-loader" },
            // jquery-ui loads some images
            { test: /\.(jpg|png|gif)$/, loader: "file" }
        ]
    }
};
