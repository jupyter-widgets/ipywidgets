// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { MathJaxTypesetter } from '@jupyterlab/mathjax-extension';
export { uuid, resolvePromisesDict } from '@jupyter-widgets/base';

const typesetter = new MathJaxTypesetter();
/**
 * Apply MathJax rendering to an element, if `text` is provided it will replace element.textContent.
 *
 * Parameters
 * ----------
 * element: Node
 * text: optional string
 */
export function typeset(element: HTMLElement, text?: string): void {
  if (text !== void 0) {
    element.textContent = text;
  }
  typesetter.typeset(element);
}

/**
 * escape text to HTML
 */
export function escape_html(text: string): string {
  const esc = document.createElement('div');
  esc.textContent = text;
  return esc.innerHTML;
}

/**
 * Creates a wrappable Promise rejection function.
 */
export function reject(message: string, log: boolean) {
  return function promiseRejection(error: Error): never {
    if (log) {
      console.error(new Error(message));
    }
    throw error;
  };
}
