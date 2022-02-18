// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

window['requirejs'].config({
  map: {
    '*': {
      '@jupyter-widgets/controls': 'nbextensions/jupyter-js-widgets/extension',
      '@jupyter-widgets/base': 'nbextensions/jupyter-js-widgets/extension',
      '@jupyter-widgets/output': 'nbextensions/jupyter-js-widgets/extension',
    },
  },
});

var MIME_TYPE = 'application/vnd.jupyter.widget-view+json';
var CLASS_NAME = 'jupyter-widgets-view';

var mngr = require('./manager');
require('./save_state');
require('./embed_widgets');
var LuminoWidget = require('@lumino/widgets');
var LuminoMessaging = require('@lumino/messaging');

var NOTEBOOK_VERSION_INFO = Jupyter.version.split('.');
var NOTEBOOK_MAJOR = parseInt(NOTEBOOK_VERSION_INFO[0]);
var NOTEBOOK_MINOR = parseInt(NOTEBOOK_VERSION_INFO[1]);
var NOTEBOOK_PATCH = parseInt(NOTEBOOK_VERSION_INFO[2]);

var RENDER_SHOULD_THROW =
  NOTEBOOK_MAJOR > 6 ||
  (NOTEBOOK_MAJOR == 6 && NOTEBOOK_MINOR > 4) ||
  (NOTEBOOK_MAJOR == 6 && NOTEBOOK_MINOR == 4 && NOTEBOOK_PATCH > 4);

/**
 * Create a widget manager for a kernel instance.
 */
var handle_kernel = function (Jupyter, kernel) {
  if (kernel.comm_manager && kernel.widget_manager === undefined) {
    // Clear any old widget manager
    if (Jupyter.WidgetManager) {
      Jupyter.WidgetManager._managers[0].clear_state();
    }

    // Create a new widget manager instance. Use the global
    // Jupyter.notebook handle.
    var manager = new mngr.WidgetManager(kernel.comm_manager, Jupyter.notebook);

    // For backwards compatibility and interactive use.
    Jupyter.WidgetManager = mngr.WidgetManager;

    // Store a handle to the manager so we know not to
    // another for this kernel. This also is a convenience
    // for the user.
    kernel.widget_manager = manager;
  }
};

function register_events(Jupyter, events, outputarea) {
  // If a kernel already exists, create a widget manager.
  if (Jupyter.notebook && Jupyter.notebook.kernel) {
    handle_kernel(Jupyter, Jupyter.notebook.kernel);
  }
  // When the kernel is created, create a widget manager.
  events.on(
    'kernel_created.Kernel kernel_created.Session',
    function (event, data) {
      handle_kernel(Jupyter, data.kernel);
    }
  );

  // When a kernel dies, disconnect the widgets.
  events.on(
    'kernel_killed.Session kernel_killed.Kernel kernel_restarting.Kernel',
    function (event, data) {
      var kernel = data.kernel;
      if (kernel && kernel.widget_manager) {
        kernel.widget_manager.disconnect();
      }
    }
  );

  /**
   * The views on this page. We keep this list so that we can call the view.remove()
   * method when a view is removed from the page.
   */
  var views = {};

  window.addEventListener('resize', () => {
    Object.keys(views).forEach((viewKey) => {
      LuminoMessaging.MessageLoop.postMessage(
        views[viewKey].luminoWidget,
        LuminoWidget.Widget.ResizeMessage.UnknownSize
      );
    });
  });

  var removeView = function (event, data) {
    var output = data.cell ? data.cell.output_area : data.output_area;
    var viewids = output ? output._jupyterWidgetViews : void 0;
    if (viewids) {
      viewids.forEach(function (id) {
        // this may be called after the widget is pulled off the page
        // so we temporarily put it back on the page as a kludge
        // so that Lumino can trigger the appropriate detach signals
        var view = views[id];
        view.el.style.display = 'none';
        document.body.appendChild(view.el);
        view.remove();
        delete views[id];
      });
      output._jupyterWidgetViews = [];
    }
  };

  // Deleting a cell does *not* clear the outputs first.
  events.on('delete.Cell', removeView);
  // add an event to the notebook element for *any* outputs that are cleared.
  Jupyter.notebook.container.on('clearing', '.output', removeView);

  // For before https://github.com/jupyter/notebook/pull/2411 is merged and
  // released. This does not handle the case where an empty cell is executed
  // to clear input.
  events.on('execute.CodeCell', removeView);
  events.on('clear_output.CodeCell', removeView);

  /**
   * Render data to the output area.
   */
  function render(output, data, node) {
    // data is a model id
    var manager =
      Jupyter.notebook &&
      Jupyter.notebook.kernel &&
      Jupyter.notebook.kernel.widget_manager;
    if (!manager) {
      var msg = 'Error rendering Jupyter widget: missing widget manager';
      if (RENDER_SHOULD_THROW) {
        throw new Error(msg);
      }
      node.textContent = msg;
      return;
    }

    // Missing model id means the view was removed. Hide this element.
    if (data.model_id === '') {
      if (RENDER_SHOULD_THROW) {
        throw new Error('Jupyter Widgets model not found');
      }
      node.style.display = 'none';
      return;
    }

    if (manager.has_model(data.model_id)) {
      manager
        .get_model(data.model_id)
        .then(function (model) {
          return manager.create_view(model, { output: output });
        })
        .then(function (view) {
          var id = view.cid;
          output._jupyterWidgetViews = output._jupyterWidgetViews || [];
          output._jupyterWidgetViews.push(id);
          views[id] = view;
          LuminoWidget.Widget.attach(view.luminoWidget, node);

          // Make the node completely disappear if the view is removed.
          view.once('remove', () => {
            // Since we have a mutable reference to the data, delete the
            // model id to indicate the view is removed.
            data.model_id = '';
            node.style.display = 'none';
          });
        });
    } else {
      var msg =
        'A Jupyter widget could not be displayed because the widget state could not be found. This could happen if the kernel storing the widget is no longer available, or if the widget state was not saved in the notebook. You may be able to create the widget by running the appropriate cells.';
      if (RENDER_SHOULD_THROW) {
        throw new Error(msg);
      }
      node.textContent = msg;
      return;
    }
  }

  // `this` is the output area we are appending to
  var append_mime = function (json, md, element) {
    var toinsert = this.create_output_subarea(md, CLASS_NAME, MIME_TYPE);
    this.keyboard_manager.register_events(toinsert);
    render(this, json, toinsert[0]);
    element.append(toinsert);
    return toinsert;
  };

  // Register mime type with the output area
  outputarea.OutputArea.prototype.register_mime_type(MIME_TYPE, append_mime, {
    // An output widget could contain arbitrary user javascript
    safe: false,
    // Index of renderer in `output_area.display_order`
    index: 0,
  });
}

function load_ipython_extension() {
  return new Promise(function (resolve) {
    requirejs(
      ['base/js/namespace', 'base/js/events', 'notebook/js/outputarea'],
      function (Jupyter, events, outputarea) {
        require('@lumino/widgets/style/index.css');
        require('@jupyter-widgets/base/css/index.css');
        require('@jupyter-widgets/controls/css/widgets.css');
        register_events(Jupyter, events, outputarea);
        resolve();
      }
    );
  });
}

module.exports = {
  load_ipython_extension: load_ipython_extension,
  ...require('@jupyter-widgets/controls'),
  ...require('@jupyter-widgets/base'),
  ...require('./widget_output'),
};
