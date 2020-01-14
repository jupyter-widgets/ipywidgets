// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export * from './htmlmanager';
export { requireLoader } from './libembed-amd';

export const version = require('../package.json').version;

export function generateEmbedScript(
  widgetState: any,
  imageDataUrl: string
): string {
  return `<img src=${imageDataUrl} class="jupyter-widget">
<script type="application/vnd.jupyter.widgets-state+json">${JSON.stringify(
    widgetState
  )}</script>`;
}
