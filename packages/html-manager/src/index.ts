// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export * from "./embed-helper";
export * from "./htmlmanager";

// We make the base @jupyter-widgets/base and @jupyter-widgets/controls modules
// available so that other modules can require them.

window['requirejs'].config({
    map: {
        '*': {
            '@jupyter-widgets/base': 'base',
            '@jupyter-widgets/controls': 'controls',
        },
    }
});
