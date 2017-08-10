// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    HTMLManager
} from './index';

import {
    renderInlineWidgets
} from './embedlib';

// Render the widgets that we can
if (!(window as any)._jupyter_widget_embedder) {
   (window as any)._jupyter_widget_embedder = true;
    window.addEventListener('load', () => {
        renderInlineWidgets(() => new HTMLManager())
    });
}
