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
        let require = (window as any).requirejs;
        if (require === undefined) {
            reject("Requirejs is needed, please ensure it is loaded on the page.");
        } else {
            require(pkg, resolve, reject);
        }
    });
}

function moduleNameToCDNUrl(moduleName: string, moduleVersion: string) {
    let packageName = moduleName;
    let fileName = 'index'; // default filename
    // if a '/' is present, like 'foo/bar', packageName is changed to 'foo', and path to 'bar'
    // We first find the first '/'
    let index = moduleName.indexOf('/');
    if ((index != -1) && (moduleName[0] == '@')) {
        // if we have a namespace, it's a different story
        // @foo/bar/baz should translate to @foo/bar and baz
        // so we find the 2nd '/'
        index = moduleName.indexOf('/', index+1);
    }
    if (index != -1) {
        fileName = moduleName.substr(index+1);
        packageName = moduleName.substr(0, index);
    }
    return `https://unpkg.com/${packageName}@${moduleVersion}/dist/${fileName}.js`;
}

function requireLoader(moduleName: string, moduleVersion: string) {
    return requirePromise([`${moduleName}`]).catch((err) => {
        let failedId = err.requireModules && err.requireModules[0];
        if (failedId) {
            console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
            return requirePromise([moduleNameToCDNUrl(moduleName, moduleVersion)]);
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
