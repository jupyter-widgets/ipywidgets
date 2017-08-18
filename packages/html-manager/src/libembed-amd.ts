// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as libembed from './libembed';

/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
let requirePromise = function(pkg: string | string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        let require = (window as any).require;
        if (require === undefined) {
            reject("Requirejs is needed, please ensure it is loaded on the page.");
        } else {
            require(pkg, resolve, reject);
        }
    });
}

function requireLoader(moduleName: string, moduleVersion: string) {
    return requirePromise([`${moduleName}`]).catch((err) => {
        let failedId = err.requireModules && err.requireModules[0];
        if (failedId) {
            console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
            return requirePromise([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`]);
        }
    });
}

/**
 * Render widgets in a given element.
 *
 * @param element (default document.documentElement) The element containing widget state and views.
 */
export
function renderWidgets(element = document.documentElement) {
    requirePromise(['@jupyter-widgets/html-manager']).then((htmlmanager) => {
        let managerFactory = () => {
            return new htmlmanager.HTMLManager({loader: requireLoader});
        }
        libembed.renderWidgets(managerFactory, element);
    });
}
