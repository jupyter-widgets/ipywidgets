// TODO: Remove this ugliest hack of all hacks once ipywidgets moves to commonjs
// Hack: Trick browserify (and other static analysis based compilers) that these
// files will be imported.  Related, browserify doesn't support dynamically
// required files: https://github.com/substack/node-browserify/issues/377
function requireLocalFiles() {
    require('underscore');
    require('backbone');
    require('jquery');
    require('jquery-ui');
    require('bootstrap');
    require('./utils');
    require('./widget');
    require('./widget_int');
    require('./manager-base');
    require('../css/widgets.min.css');
}

module.exports = function createDefine(targetModule) {
    var amdefine = require('amdefine')(targetModule, require);
    
    return function define() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 1) {
            args[0] = args[0].map(function(arg) {
                arg = arg.replace('nbextensions/widgets/components/require-css/css!', '');
                return arg;
            });
        }
        amdefine.apply(this, args);
    };
};
