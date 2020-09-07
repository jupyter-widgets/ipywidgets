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
    }
  }
  return ErrorWidget;
}

export function createErrorWidgetView(error?: Error): typeof WidgetView {
  return class ErrorWidgetView extends DOMWidgetView {
    render() {
      const module = this.model.get('_model_module');
      const name = this.model.get('_model_name');
      const viewModule = this.model.get('_view_module');
      const viewName = this.model.get('_view_name');
      const errorMessage = String(error || this.model.get('error').stack);
      this.el.innerHTML = `Failed to create WidgetView '${viewName}' from module '${viewModule}' for WidgetModel '${name}' from module '${module}', error:<pre>${errorMessage}</pre>`;
    }
  };
}

export class ErrorWidgetView extends DOMWidgetView {
  render() {
    console.log('render');
    const module = this.model.get('failed_module');
    const name = this.model.get('failed_model_name');
    const errorMessage = String(this.model.get('error').stack);
    this.el.innerHTML = `Failed to load widget '${name}' from module '${module}', error:<pre>${errorMessage}</pre>`;
  }
}
