import {
  WidgetModel,
  DOMWidgetModel,
  DOMWidgetView,
  WidgetView,
} from './widget';
import { JUPYTER_WIDGETS_VERSION } from './version';

const SVG_ICON = `<svg style="height:50%;max-height: 50px;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<g >
  <g transform="translate(0.24520123,0.93464292)">
    <path  d="M 8.2494641,21.074514 V 5.6225142 c 0,-0.314 0.254,-0.567 0.57,-0.567 H 29.978464 c 2.388,0 9.268,5.8269998 9.268,8.3029998 v 5.5835 l -3.585749,4.407396 -2.772971,-3.535534 -5.126524,3.414213 -5.944543,-3.237436 -5.722718,3.06066 z m 30.9969999,3.8675 v 15.5835 c 0,0.314 -0.254,0.567 -0.57,0.567 H 8.8194641 c -0.315,0.002 -0.57,-0.251 -0.57,-0.566 v -15.452 l 7.8444949,2.628449 5.656854,-2.65165 4.24264,3.005204 5.833631,-3.237437 3.712311,3.944543 z" style="fill:url(#linearGradient3448);stroke:#888a85"  />
    <path d="m 30.383464,12.110514 c 4.108,0.159 7.304,-0.978 8.867,1.446 0.304,-3.9679998 -7.254,-8.8279998 -9.285,-8.4979998 0.813,0.498 0.418,7.0519998 0.418,7.0519998 z" style="fill:url(#linearGradient3445);stroke:#868a84" />
    <path enable-background="new" d="m 31.443464,11.086514 c 2.754,-0.019 4.106,-0.49 5.702,0.19 -1.299,-1.8809998 -4.358,-3.3439998 -5.728,-4.0279998 0.188,0.775 0.026,3.8379998 0.026,3.8379998 z" style="opacity:0.36930003;fill:none;stroke:url(#linearGradient3442)" />
  </g>
</g>
</svg>`;

// create a Widget Model that captures an error object
export function createErrorWidget(
  error: Error,
  msg?: string
): typeof WidgetModel {
  class ErrorWidget extends DOMWidgetModel {
    constructor(attributes: any, options: any) {
      attributes = {
        ...attributes,
        _view_name: 'ErrorWidgetView',
        _view_module: '@jupyter-widgets/base',
        _model_module_version: JUPYTER_WIDGETS_VERSION,
        _view_module_version: JUPYTER_WIDGETS_VERSION,
        msg: msg,
        error: error,
      };
      super(attributes, options);
      this.comm_live = true;
    }
  }
  return ErrorWidget;
}

export class ErrorWidgetView extends DOMWidgetView {
  generateErrorMessage(): { msg?: string; stack: string } {
    return {
      msg: this.model.get('msg'),
      stack: String(this.model.get('error').stack),
    };
  }
  render(): void {
    const { msg, stack } = this.generateErrorMessage();
    this.el.classList.add('jupyter-widgets');

    const content = document.createElement('div');
    content.classList.add('jupyter-widgets-error-widget', 'icon-error');
    content.innerHTML = SVG_ICON;
    const text = document.createElement('p');
    text.innerText = 'Click to show error.';
    content.append(text);

    this.el.appendChild(content);

    let width: number;
    let height: number;
    this.el.onclick = () => {
      if (content.classList.contains('icon-error')) {
        height = height || content.clientHeight;
        width = width || content.clientWidth;
        content.classList.remove('icon-error');
        content.innerHTML = `<pre>[Double click to close this message]\n${msg}\n${stack}</pre>`;
        content.style.height = `${height}px`;
        content.style.width = `${width}px`;
        content.classList.add('text-error');
      }
    };
    this.el.ondblclick = () => {
      if (content.classList.contains('text-error')) {
        content.classList.remove('text-error');
        content.innerHTML = SVG_ICON;
        content.append(text);
        content.classList.add('icon-error');
      }
    };
  }
}

export function createErrorWidgetView(
  error?: Error,
  msg?: string
): typeof WidgetView {
  return class InnerErrorWidgetView extends ErrorWidgetView {
    generateErrorMessage(): { msg?: string; stack: string } {
      return { msg, stack: String(error?.stack) };
    }
  };
}
