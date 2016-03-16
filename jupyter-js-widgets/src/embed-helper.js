// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

function generateEmbedScript(widgetState, alternativeHtml) {
  return ["if (typeof w === 'undefined') {",
    "  var container = document.createElement('div');",
    "  container.innerHTML = atob('" + btoa(alternativeHtml) + "');",
    "  var context = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0];",
    "  context.parentElement.insertBefore(container, context);",
    "} else {",
    "  w(" + JSON.stringify(widgetState) + ");",
    "}"].join('\n');
}

module.exports = {
  generateEmbedScript,
};
