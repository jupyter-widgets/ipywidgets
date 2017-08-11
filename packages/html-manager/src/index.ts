// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export * from "./htmlmanager";

export
const version = (require('../package.json') as any).version;

export
function generateEmbedScript(widgetState, imageDataUrl) {
  return [
      '<img src=' + imageDataUrl + ' class="jupyter-widget">',
      '<script type="application/vnd.jupyter.widgets-state+json">' + JSON.stringify(widgetState) + '</script>'
  ].join('\n');
}
