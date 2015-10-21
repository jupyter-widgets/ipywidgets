var jsdom = require('jsdom');
jsdom.env('<html><head/><body/></html>', function (err, window) {
    if (err) {
        console.error('Error while setting up JSDom', err);
    } else {
        global.window = window;
        global.document = window.document;
        global.navigator = require('navigator');
        
        // DEMO
        // Log the keys of ipywidgets.
        var ipywidgets = require('ipywidgets');
        console.log(Object.keys(ipywidgets));

        // Clean-up DOM
        window.close();
    }
});
