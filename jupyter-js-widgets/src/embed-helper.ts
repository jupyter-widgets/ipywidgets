// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export
function generateEmbedScript(widgetState, imageDataUrl) {
  return [
      '<img src=' + imageDataUrl + ' class="jupyter-widget">',
      '<script type="application/vnd.jupyter-embedded-widgets">' + JSON.stringify(widgetState) + '</script>'
  ].join('\n');
}
