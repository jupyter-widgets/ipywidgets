// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export
function generateEmbedScript(widgetState, imageDataUrl) {
  return [
      '<img src=' + imageDataUrl + ' class="jupyter-widget">',
      '<script type="application/vnd.jupyter.widgets-state+json">' + JSON.stringify(widgetState) + '</script>'
  ].join('\n');
}

export
let loadRequire = new Promise((resolve, reject) => {
    if ((window as any).requirejs) {
        resolve();
    } else {
        // If requirejs is not on the page on page load, load it from cdn.
        let scriptjs = require('scriptjs') as any;
        scriptjs('https://unpkg.com/requirejs/require.js', resolve);
    }
}).then(() => {
    // We make the base @jupyter-widgets/base and @jupyter-widgets/controls
    // modules available so that other modules can require them.
    window['requirejs'].config({
        map: {
            '*': {
                '@jupyter-widgets/base': 'base',
                '@jupyter-widgets/controls': 'controls',
            },
        }
    });
});
