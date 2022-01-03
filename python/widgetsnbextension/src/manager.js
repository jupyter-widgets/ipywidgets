// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var base = require('@jupyter-widgets/base');
var ManagerBase = require('@jupyter-widgets/base-manager').ManagerBase;
var widgets = require('@jupyter-widgets/controls');
var outputWidgets = require('./widget_output');
var saveState = require('./save_state');
var embedWidgets = require('./embed_widgets');

var MIME_TYPE = 'application/vnd.jupyter.widget-view+json';

function polyfill_new_comm_buffers(
  manager,
  target_name,
  data,
  callbacks,
  metadata,
  comm_id,
  buffers
) {
  /**
   * This polyfills services/kernel/comm/CommManager.new_comm to
   * accept the buffers argument.
   *
   * argument comm_id is optional
   */
  return new Promise(function (resolve) {
    requirejs(['services/kernels/comm'], function (comm) {
      var comm = new comm.Comm(target_name, comm_id);
      manager.register_comm(comm);
      // inline Comm.open(), but with buffers
      var content = {
        comm_id: comm_id,
        target_name: target_name,
        data: data || {},
      };
      comm.kernel.send_shell_message(
        'comm_open',
        content,
        callbacks,
        metadata,
        buffers
      );
      resolve(comm);
    });
  });
}

function new_comm(
  manager,
  target_name,
  data,
  callbacks,
  metadata,
  comm_id,
  buffers
) {
  // Checks whether new_comm needs a polyfill, and calls the correct version
  // Polyfill needed for notebook <5.1, in which the new_comm method does not support a buffers argument.
  // See https://github.com/jupyter-widgets/ipywidgets/pull/1817
  var need_polyfill = manager.new_comm.length < 6;
  if (need_polyfill) {
    return polyfill_new_comm_buffers.apply(null, arguments);
  }
  return manager.new_comm.apply(
    manager,
    Array.prototype.slice.call(arguments, 1)
  );
}

//--------------------------------------------------------------------
// WidgetManager class
//--------------------------------------------------------------------

export class WidgetManager extends ManagerBase {
  constructor(comm_manager, notebook) {
    super();
    // Managers are stored in *reverse* order, so that _managers[0] is the most recent.
    WidgetManager._managers.unshift(this);

    // Attach a comm manager
    this.notebook = notebook;
    this.keyboard_manager = notebook.keyboard_manager;
    this.comm_manager = comm_manager;

    var widget_md = notebook.metadata.widgets;

    // Steps that needs to be done:
    // 1. Register comm target
    // 2. Get any widget state from the kernel and open comms with existing state
    // 3. Check saved state for widgets, and restore any that would not overwrite
    //    any live widgets.

    // Register with the comm manager. (1)
    this.comm_manager.register_target(
      this.comm_target_name,
      this.handle_comm_open.bind(this)
    );

    var that = this;

    this._loadFromKernel()
      .then(function () {
        // Now that we have mirrored any widgets from the kernel...
        // Restore any widgets from saved state that are not live (3)
        if (
          widget_md &&
          widget_md['application/vnd.jupyter.widget-state+json']
        ) {
          var state =
            notebook.metadata.widgets[
              'application/vnd.jupyter.widget-state+json'
            ];
          state = that.filterExistingModelState(state);
          return that.set_state(state);
        }
      })
      .then(function () {
        // Rerender cells that have widget data
        that.notebook.get_cells().forEach(function (cell) {
          var rerender =
            cell.output_area &&
            cell.output_area.outputs.find(function (output) {
              return output.data && output.data[MIME_TYPE];
            });
          if (rerender) {
            that.notebook.render_cell_output(cell);
          }
        });
      });

    // Create the actions and menu
    this._init_actions();
    this._init_menu();
  }

  loadClass(className, moduleName, moduleVersion) {
    const failure = () => {
      throw new Error(
        'Class ' + className + ' not found in module ' + moduleName
      );
    };
    if (moduleName === '@jupyter-widgets/controls') {
      return widgets[className]
        ? Promise.resolve(widgets[className])
        : failure();
    } else if (moduleName === '@jupyter-widgets/base') {
      return base[className] ? Promise.resolve(base[className]) : failure();
    } else if (moduleName == '@jupyter-widgets/output') {
      return outputWidgets[className]
        ? Promise.resolve(outputWidgets[className])
        : failure();
    } else {
      return new Promise(function (resolve, reject) {
        window.require([moduleName], resolve, reject);
      }).then(function (mod) {
        if (mod[className]) {
          return mod[className];
        } else {
          return failure();
        }
      });
    }
  }

  /**
   * Registers manager level actions with the notebook actions list
   */
  _init_actions() {
    var notifier = Jupyter.notification_area.widget('widgets');
    this.saveWidgetsAction = {
      handler: function () {
        this.get_state({
          drop_defaults: true,
        }).then(function (state) {
          Jupyter.notebook.metadata.widgets = {
            'application/vnd.jupyter.widget-state+json': state,
          };
          Jupyter.menubar.actions
            .get('jupyter-notebook:save-notebook')
            .handler({
              notebook: Jupyter.notebook,
            });
        });
      }.bind(this),
      icon: 'fa-truck',
      help: 'Save the notebook with the widget state information for static rendering',
    };
    Jupyter.menubar.actions.register(
      this.saveWidgetsAction,
      'save-with-widgets',
      'widgets'
    );

    this.clearWidgetsAction = {
      handler: function () {
        delete Jupyter.notebook.metadata.widgets;
        Jupyter.menubar.actions.get('jupyter-notebook:save-notebook').handler({
          notebook: Jupyter.notebook,
        });
      },
      help: 'Clear the widget state information from the notebook',
    };
    Jupyter.menubar.actions.register(
      this.saveWidgetsAction,
      'save-clear-widgets',
      'widgets'
    );
  }

  /**
   * Initialize the widget menu
   */
  _init_menu() {
    // Add a widgets menubar item, before help.
    var widgetsMenu = document.createElement('li');
    widgetsMenu.classList.add('dropdown');
    var helpMenu = document.querySelector('#help_menu').parentElement;
    helpMenu.parentElement.insertBefore(widgetsMenu, helpMenu);

    var widgetsMenuLink = document.createElement('a');
    widgetsMenuLink.setAttribute('href', '#');
    widgetsMenuLink.setAttribute('data-toggle', 'dropdown');
    widgetsMenuLink.classList.add('dropdown-toggle');
    widgetsMenuLink.innerText = 'Widgets';
    widgetsMenu.appendChild(widgetsMenuLink);

    var widgetsSubmenu = document.createElement('ul');
    widgetsSubmenu.setAttribute('id', 'widget-submenu');
    widgetsSubmenu.classList.add('dropdown-menu');
    widgetsMenu.appendChild(widgetsSubmenu);

    var divider = document.createElement('ul');
    divider.classList.add('divider');

    widgetsSubmenu.appendChild(
      this._createMenuItem('Save Notebook Widget State', this.saveWidgetsAction)
    );
    widgetsSubmenu.appendChild(
      this._createMenuItem(
        'Clear Notebook Widget State',
        this.clearWidgetsAction
      )
    );
    widgetsSubmenu.appendChild(divider);
    widgetsSubmenu.appendChild(
      this._createMenuItem('Download Widget State', saveState.action)
    );
    widgetsSubmenu.appendChild(
      this._createMenuItem('Embed Widgets', embedWidgets.action)
    );
  }

  /**
   * Creates a menu item for an action.
   * @param  {string} title - display string for the menu item
   * @param  {Action} action
   * @return {HTMLElement} menu item
   */
  _createMenuItem(title, action) {
    var item = document.createElement('li');
    item.setAttribute('title', action.help);

    var itemLink = document.createElement('a');
    itemLink.setAttribute('href', '#');
    itemLink.innerText = title;
    item.appendChild(itemLink);

    item.onclick = action.handler;
    return item;
  }

  _create_comm(comm_target_name, comm_id, data, metadata, buffers) {
    var that = this;
    return this._get_connected_kernel().then(function (kernel) {
      if (data || metadata) {
        return new_comm(
          kernel.comm_manager,
          comm_target_name,
          data,
          that.callbacks(),
          metadata,
          comm_id,
          buffers
        );
      } else {
        // Construct a comm that already is open on the kernel side. We
        // don't want to send an open message, which would supersede the
        // kernel comm object, so we instead do by hand the necessary parts
        // of the new_comm call above.
        return new Promise(function (resolve) {
          requirejs(['services/kernels/comm'], function (comm) {
            var new_comm = new comm.Comm(comm_target_name, comm_id);
            kernel.comm_manager.register_comm(new_comm);
            resolve(new_comm);
          });
        });
      }
    });
  }

  _get_comm_info() {
    /**
     * Gets a promise for the valid widget models.
     */
    var that = this;
    return this._get_connected_kernel().then(function (kernel) {
      return new Promise(function (resolve, reject) {
        kernel.comm_info('jupyter.widget', function (msg) {
          resolve(msg['content']['comms']);
        });
      });
    });
  }

  _get_connected_kernel() {
    /**
     * Gets a promise for a connected kernel
     */
    var that = this;
    return new Promise(function (resolve, reject) {
      if (
        that.comm_manager &&
        that.comm_manager.kernel &&
        that.comm_manager.kernel.is_connected()
      ) {
        resolve(that.comm_manager.kernel);
      } else {
        that.notebook.events.on(
          'kernel_connected.Kernel',
          function (event, data) {
            resolve(data.kernel);
          }
        );
      }
    });
  }

  setViewOptions(options) {
    var options = options || {};
    if (!options.output && options.parent) {
      // use the parent output if we don't have one
      options.output = options.parent.options.output;
    }
    if (options.output) {
      options.iopub_callbacks = {
        output: options.output.handle_output.bind(options.output),
        clear_output: options.output.handle_clear_output.bind(options.output),
      };
    }
    return options;
  }

  /**
   * Callback handlers for a specific view
   */
  callbacks(view) {
    var callbacks = ManagerBase.prototype.callbacks.call(this, view);
    if (view && view.options.iopub_callbacks) {
      callbacks.iopub = view.options.iopub_callbacks;
    }
    return callbacks;
  }
}

/**
 * List of widget managers in *reverse* order
 * (_managers[0] is the most recent)
 */
WidgetManager._managers = [];
