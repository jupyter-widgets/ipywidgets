import {
  WidgetModel,
  DOMWidgetModel,
  DOMWidgetView,
  WidgetView
} from './widget';
import { JUPYTER_WIDGETS_VERSION } from './version';

// create a Widget Model that captures an error object
export function createErrorWidget(error: Error): typeof WidgetModel {
  class ErrorWidget extends DOMWidgetModel {
    constructor(attributes: any, options: any) {
      attributes = {
        ...attributes,
        _view_name: 'ErrorWidgetView',
        _view_module: '@jupyter-widgets/base',
        _model_module_version: JUPYTER_WIDGETS_VERSION,
        _view_module_version: JUPYTER_WIDGETS_VERSION,
        failed_module: attributes._model_module,
        failed_model_name: attributes._model_name,
        error: error
      };
      super(attributes, options);
      this.comm_live = true;
    }
  }
  return ErrorWidget;
}


export class ErrorWidgetView extends DOMWidgetView {
  generateErrorMessage(): string {
    return String(this.model.get('error').stack);
  }
  render(): void {
    const module = this.model.get('failed_module');
    const name = this.model.get('failed_model_name');
    const errorMessage = this.generateErrorMessage();
    this.el.classList.add('jupyter-widgets');

    const content = document.createElement('div');
    const icon = '<svg style="height:50%;max-height: 50px;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M304.083 405.907c4.686 4.686 4.686 12.284 0 16.971l-44.674 44.674c-59.263 59.262-155.693 59.266-214.961 0-59.264-59.265-59.264-155.696 0-214.96l44.675-44.675c4.686-4.686 12.284-4.686 16.971 0l39.598 39.598c4.686 4.686 4.686 12.284 0 16.971l-44.675 44.674c-28.072 28.073-28.072 73.75 0 101.823 28.072 28.072 73.75 28.073 101.824 0l44.674-44.674c4.686-4.686 12.284-4.686 16.971 0l39.597 39.598zm-56.568-260.216c4.686 4.686 12.284 4.686 16.971 0l44.674-44.674c28.072-28.075 73.75-28.073 101.824 0 28.072 28.073 28.072 73.75 0 101.823l-44.675 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.598 39.598c4.686 4.686 12.284 4.686 16.971 0l44.675-44.675c59.265-59.265 59.265-155.695 0-214.96-59.266-59.264-155.695-59.264-214.961 0l-44.674 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.597 39.598zm234.828 359.28l22.627-22.627c9.373-9.373 9.373-24.569 0-33.941L63.598 7.029c-9.373-9.373-24.569-9.373-33.941 0L7.029 29.657c-9.373 9.373-9.373 24.569 0 33.941l441.373 441.373c9.373 9.372 24.569 9.372 33.941 0z"></path></svg>'
    content.classList.add('jupyter-widgets-error-widget','icon-error');
    content.style.margin = '0 auto'
    content.innerHTML = icon;
    this.el.appendChild(content);
    this.el.onclick = () => {
      if(content.classList.contains('icon-error')){
        content.classList.remove('icon-error');
        content.innerHTML = ` <pre>Failed to load widget '${name}' from module '${module} \n ${errorMessage}</pre>`;
        content.classList.add('text-error');
      } else if(content.classList.contains('text-error')){
        content.classList.remove('text-error');
        content.innerHTML = icon;
        content.classList.add('icon-error');
      }
    }
  }
}

export function createErrorWidgetView(error?: Error): typeof WidgetView {
  return class InnerErrorWidgetView extends ErrorWidgetView {
    generateErrorMessage(): string {
      return String(error?.stack);
    } 
  };
}

