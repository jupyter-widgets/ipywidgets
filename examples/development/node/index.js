var jsdom = require('jsdom');
jsdom.env('<html><head/><body/></html>', function (err, window) {
    if (err) {
        console.error('Error while setting up JSDom', err);
    } else {
        global.window = window;
        global.document = window.document;
        global.navigator = require('navigator');

        // DEMO
        // Log the keys of jupyter-js-widgets.
        var jpywidgets = require('jupyter-js-widgets');
        console.log(Object.keys(jpywidgets));

        // Clean-up DOM
        window.close();
    }
});
