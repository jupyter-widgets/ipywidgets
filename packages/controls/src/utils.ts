// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export {
    uuid, WrappedError, resolvePromisesDict
} from '@jupyter-widgets/base';

import {
    WrappedError
} from '@jupyter-widgets/base';

import * as _ from 'underscore';
 * Apply MathJax rendering to an element, and optionally set its text.
 *
 * If MathJax is not available, make no changes.
 *
 * Parameters
 * ----------
 * element: Node
 * text: optional string
 */
export
function typeset(element: HTMLElement, text?: string): void {
    if (text !== void 0) {
        element.textContent = text;
    }
    if ((window as any).MathJax !== void 0) {
        MathJax!.Hub!.Queue(['Typeset', MathJax.Hub, element]);
    }
}


/**
 * escape text to HTML
 */
export
function escape_html(text: string): string {
    let esc  = document.createElement('div');
    esc.textContent = text;
    return esc.innerHTML;
}
