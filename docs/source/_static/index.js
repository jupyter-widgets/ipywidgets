// Load jquery and jquery-ui
var $ = require('jquery');
require('jquery-ui');
$.getQueryParameters = window.$.getQueryParameters;
$.urldecode = window.$.urldecode;
window.$ = window.jQuery = $;

// Load styling
require('jquery-ui/themes/smoothness/jquery-ui.min.css');
require("jupyter-js-widgets/css/widgets.min.css");

const widgets = require('jupyter-js-widgets');
console.info('jupyter-js-widgets loaded successfully');

class WidgetManager extends widgets.ManagerBase {
  displayWidgetState(models, el) {
    const displays = [];
    for (var id of Object.keys(models)) {
      displays.push(this.new_model({
        model_id: id,
        model_name: models[id].model_name,
        model_module: models[id].model_module,
      }, models[id].state).then(model => this.display_model({}, model, { el })));
    }
    return Promise.all(displays);
  }

  display_view(msg, view, options) {
    return Promise.resolve(view).then(view => {
      options.el.appendChild(view.el);
      return view;
    });
  }

  _get_comm_info() {
    return Promise.resolve({});
  }
}
const manager = window.widgetManager = new WidgetManager();

const widgetTag = Object.create(HTMLElement.prototype);
widgetTag.createdCallback = function() {
  console.info('Widget(s) detected...');
  const widgetStateJS = this.innerHTML;
  this.innerHTML = `
    <div class="widget-loading">
      <span class="glyphicon glyphicon-hourglass glyphicon-spin" aria-hidden="true"></span>
    </div>
  `;

  let widgetState;
  try {
    widgetState = JSON.parse(widgetStateJS);
  } catch (err) {
    console.error('Could not parse widget state', err);
    return;
  }

  console.info('Rendering widgets...', widgetState);
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'widget-area';
  manager.displayWidgetState(widgetState, widgetContainer).then(() => {
    this.innerHTML = '';
    this.appendChild(widgetContainer);
  });
};

document.registerElement('widget-state', {prototype: widgetTag});

window.onload = function() {
  // TODO: See if md parsing conf can do this, or extension (compile time)
  Array.prototype.forEach.call(document.querySelectorAll('a'), a => {
    a.href = a.href
      .replace(/\.md$/, '.html')
      .replace(/\.ipynb$/, '.html');
  });
};
