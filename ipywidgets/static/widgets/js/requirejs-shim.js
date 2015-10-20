module.exports = function createDefine(targetModule) {
    var amdefine = require('amdefine')(targetModule);
    
    return function define() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 1) {
            args[0] = args[0].map(function(arg) {
                if (arg === 'jqueryui') arg = 'jquery-ui';
                arg = arg.replace('nbextensions/widgets/widgets/js/', './');
                return arg;
            });
        }
        amdefine.apply(this, args);
    };
};
