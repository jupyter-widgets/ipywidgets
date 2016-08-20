var pkg = require('./package.json')
var version = pkg.version;
var fs = require('fs');
var webpack = require('webpack');

var jlabHelpers = require('jupyterlab/scripts/extension_helpers');

var findImports = require('find-imports');

// Get the list of vendor files.
//var VENDOR_FILES = findImports('./lib/**/*.js', { flatten: true });
// console.log(VENDOR_FILES);

try {
  fs.mkdirSync('./dist')
} catch(err) {
  if (err.code !== 'EEXIST') {
    throw err;
  }
}

for (var lib of ['jupyter-js-widgets']) {
  var shim = jlabHelpers.createShim(lib);
  fs.writeFileSync('./dist/' + lib + '-shim.js', shim);
}

fs.writeFileSync('./dist/HELLO.js', jlabHelpers.upstreamExternals(require));
//fs.writeFileSync('./dist/jupyter-js-widgets-labextension-shim.js', jlabHelpers.createShim('jupyter-js-widgets-labextension'));

var loaders = [
    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.json$/, loader: "json-loader" },
    // jquery-ui loads some images
    { test: /\.(jpg|png|gif)$/, loader: "file" },
]

var widgetloaders = loaders.concat([
      // for font-awesome
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" }
])

module.exports = [
  {
    entry: {
      labextension: './lib',
      // vendor: VENDOR_FILES
    },
    output: {
        filename: 'lab-extension.js',
        path: './dist',
        //library: 'jupyter-js-widgets-labextension',
        //libraryTarget: 'this',
        publicPath: 'https://npmcdn.com/jupyter-js-widgets-labextension@' + version + '/dist/'
    },
    // plugins: [
    //   new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
    // ],
    bail: true,
    devtool: 'source-map',
    module: { loaders: loaders },
    externals: jlabHelpers.upstreamExternals(require)
  },
  // jupyter-js-widgets
  {
    entry: './dist/jupyter-js-widgets-shim.js',
    output: {
        filename: 'jupyter-js-widgets.bundle.js',
        path: './dist',
        publicPath: './',
        library: ['jupyter', 'externals', 'jupyter-js-widgets']
    },
    module: { loaders: widgetloaders },
    bail: true,
    externals: jlabHelpers.upstreamExternals(require, true),
    devtool: 'source-map',
  }
];
