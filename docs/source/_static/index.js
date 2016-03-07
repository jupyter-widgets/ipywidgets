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
      if (this._models[id]) {
        displays.push(this._models[id].then(model => {
          return this.display_model({}, model, { el })
        }));
      } else {
        displays.push(this.new_model({
          model_id: id,
          model_name: models[id].model_name,
          model_module: models[id].model_module,
        }, models[id].state).then(model => this.display_model({}, model, { el })));
      }
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

// Magic global widget rendering function:
window.w = function renderWidgetState(widgetStateObject) {

  // Create the container div and insert it into the DOM immediately above the
  // current script tag.
  console.info('Inserting widget(s)...');
  var container = document.createElement('div');
  container.innerHTML = `
    <div class="widget-loading">
      <span class="glyphicon glyphicon-hourglass glyphicon-spin" aria-hidden="true"></span>
    </div>
  `;

  // Assume that the current script tag is the last script tag, because the
  // script tags are processed immediately as the browser traverses through the
  // DOM.
  var context = Array.prototype.slice.call(document.querySelectorAll('script'), -1)[0];
  context.parentElement.insertBefore(container, context);

  // Create and render the widget, replacing the loading view.
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'widget-area';
  manager.displayWidgetState(widgetStateObject, widgetContainer).then(() => {
    container.innerHTML = '';
    container.appendChild(widgetContainer);
  });
}

window.onload = function() {
  // TODO: See if md parsing conf can do this, or extension (compile time)
  Array.prototype.forEach.call(document.querySelectorAll('a'), a => {
    a.href = a.href
      .replace(/\.md$/, '.html')
      .replace(/\.ipynb$/, '.html');
  });
};
