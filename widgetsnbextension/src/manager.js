// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
"use strict";

var _ = require("underscore");
var Backbone = require("backbone");
var widgets = require("jupyter-js-widgets");
var html2canvas = require("html2canvas");
var progressModal = require("./progress-modal");
var saveState = require("./save_state");
var embedWidgets = require("./embed_widgets");
var version = require("../package.json").version;


// Work around for a logging bug, reported in https://github.com/niklasvh/html2canvas/issues/543
window.html2canvas = html2canvas;

//--------------------------------------------------------------------
// WidgetManager class
//--------------------------------------------------------------------
var WidgetManager = function (comm_manager, notebook) {
    widgets.ManagerBase.apply(this);
    WidgetManager._managers.push(this);

    // Attach a comm manager
    this.notebook = notebook;
    this.keyboard_manager = notebook.keyboard_manager;
    this.comm_manager = comm_manager;

    // Register with the comm manager.
    this.comm_manager.register_target(this.comm_target_name, _.bind(this.handle_comm_open,this));

    // Attempt to reconstruct any live comms by requesting them from the
    // back-end.
    var that = this;
    var backed_widgets_loaded = this._get_comm_info().then(function(comm_ids) {

        // Create comm class instances from comm ids.
        var comm_promises = Object.keys(comm_ids).map(function(comm_id) {
            return that._create_comm(that.comm_target_name, comm_id);
        });

        // Send a state request message out for each widget comm and wait
        // for the responses.
        return Promise.all(comm_promises).then(function(comms) {
            return Promise.all(comms.map(function(comm) {
                var update_promise = new Promise(function(resolve, reject) {
                    comm.on_msg(function (msg) {

                        // A suspected response was received, check to see if
                        // it's a state update.  If so, resolve.
                        if (msg.content.data.method === 'update') {
                            resolve({
                                comm: comm,
                                msg: msg
                            });
                        }
                    });
                });

                comm.send({
                    method: 'request_state'
                }, that.callbacks());
                return update_promise;
            }));
        }).then(function(widgets_info) {
            return Promise.all(widgets_info.map(function(widget_info) {
                return that.new_model({
                    model_name: widget_info.msg.content.data.state._model_name,
                    model_module: widget_info.msg.content.data.state._model_module,
                    comm: widget_info.comm,
                }, widget_info.msg.content.data.state);
            }));
        }).then(function(models) {

            // Load the view information from the notebook metadata.
            if (WidgetManager._load_callback) {
                WidgetManager._load_callback.call(that).then(function(state) {
                    var filtered_state = Object.keys(state).reduce(function(obj, key) {
                        // Filter for keys that are live model ids.
                        if (that.get_model(key)) {
                            obj[key] = state[key];
                        }
                        return obj;
                    }, {});
                    that.set_state(filtered_state);
                }).catch(widgets.reject('Error loading widget manager state', true));
            }
        });
    });

    // Setup state saving code.
    this.notebook.events.on('before_save.Notebook', (function() {

        // Append snapshots of the widgets to the notebook's state before
        // saving the notebook.
        this.prependSnapshots();

        var save_callback = WidgetManager._save_callback;
        var options = WidgetManager._get_state_options;
        if (save_callback) {
            this.get_state(options).then((function(state) {
                save_callback.call(this, state);
            }).bind(this)).catch(widgets.reject('Could not call widget save state callback.', true));
        }
    }).bind(this));

    // Validate the version requested by the backend.
    var validate = (function validate() {
        this.validateVersion().then(function(valid) {
            if (!valid) {
                console.warn('Widget frontend version does not match the backend.');
            }
        }).catch(function(err) {
            console.warn('Could not cross validate the widget frontend and backend versions.', err);
        });
    }).bind(this);
    validate();

    // Revalidate the version when a new kernel connects.
    this.notebook.events.on('kernel_connected.Kernel', function(event, data) {
        validate();
    });

    // Delete the snapshots when the notebook has saved, failed to save, is
    // loaded from disk, and when the widget manager is constructed.
    this.notebook.events.on('notebook_saved.Notebook', this.deleteSnapshots.bind(this));
    this.notebook.events.on('notebook_save_failed.Notebook', this.deleteSnapshots.bind(this));
    this.notebook.events.on('notebook_loaded.Notebook', this.deleteSnapshots.bind(this));
    this.deleteSnapshots();

    // Create the actions and menu
    this._init_actions();
    this._init_menu();

    // Initialize the widget screenshot rendering dialog.
    this.progressModal = new progressModal.ProgressModal();
};
WidgetManager.prototype = Object.create(widgets.ManagerBase.prototype);

WidgetManager._managers = []; /* List of widget managers */
WidgetManager._load_callback = null;
WidgetManager._save_callback = null;


WidgetManager.register_widget_model = function (model_name, model_type) {
    /**
     * Registers a widget model by name.
     */
    return widgets.ManagerBase.register_widget_model.apply(this, arguments);
};

WidgetManager.register_widget_view = function (view_name, view_type) {
    /**
     * Registers a widget view by name.
     */
    return widgets.ManagerBase.register_widget_view.apply(this, arguments);
};

WidgetManager.set_state_callbacks = function (load_callback, save_callback, options) {
    /**
     * Registers callbacks for widget state persistence.
     *
     * Parameters
     * ----------
     * load_callback: function()
     *      function that is called when the widget manager state should be
     *      loaded.  This function should return a promise for the widget
     *      manager state.  An empty state is an empty dictionary `{}`.
     * save_callback: function(state as dictionary)
     *      function that is called when the notebook is saved or autosaved.
     *      The current state of the widget manager is passed in as the first
     *      argument.
     */
    WidgetManager._load_callback = load_callback;
    WidgetManager._save_callback = save_callback;
    WidgetManager._get_state_options = options || {};

    // Use the load callback to immediately load widget states.
    WidgetManager._managers.forEach(function(manager) {
        if (load_callback) {
            Promise.resolve().then(function () {
                return load_callback.call(manager);
            }).then(function(state) {
                manager.set_state(state);
            }).catch(widgets.reject('Error loading widget manager state', true));
        }
    });
};

// Use local storage to persist widgets across page refresh by default.
// LocalStorage is per domain, so we need to explicitly set the URL
// that the widgets are associated with so they don't show on other
// pages hosted by the noteboook server.
var url = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
var key = 'widgets:' + url;
WidgetManager.set_state_callbacks(function() {
    if (Jupyter.notebook.metadata.widgets) {
        return Promise.resolve(Jupyter.notebook.metadata.widgets.state);
    }
    return Promise.resolve({});
}, function(state) {
    var stateToSave = {};
    _.mapObject(state, function(widgetState, key) {
        // don't persist widget state with no views
        if (widgetState.views.length === 0) return;
        // Only persist the views of the widget
        stateToSave[key] = _.pick(widgetState, 'views');
    });

    // check if there are any views to persist
    if (Object.keys(stateToSave).length === 0) {
        // no widget state, don't save empty widget state in metadata
        delete Jupyter.notebook.metadata.widgets;
        return;
    }

    Jupyter.notebook.metadata.widgets = {
        state: stateToSave,
        // Persisted widget state version
        version: version,
    };
});

WidgetManager.prototype._handle_display_view = function (view) {
    /**
     * Have the IPython keyboard manager disable its event
     * handling so the widget can capture keyboard input.
     * Note, this is only done on the outer most widgets.
     */
    view.trigger('displayed');

    if (this.keyboard_manager) {
        this.keyboard_manager.register_events(view.el);

        if (view.additional_elements) {
            for (var i = 0; i < view.additional_elements.length; i++) {
                this.keyboard_manager.register_events(view.additional_elements[i]);
            }
        }
    }
};

/**
 * Registers manager level actions with the notebook actions list
 */
WidgetManager.prototype._init_actions = function() {
    var notifier = Jupyter.notification_area.new_notification_widget('widgets');
    this.buildSnapshotsAction = {
        handler: (function() {
            this.updateSnapshots().then((function() {
                notifier.set_message('Widgets rendered', 3000);
            }).bind(this));
        }).bind(this),
        icon: 'fa-truck',
        help: 'Rasterizes the current state of the widgets to the notebook as PNG images.'
    };
    Jupyter.menubar.actions.register(this.buildSnapshotsAction, 'save-with-snapshots', 'widgets');
};

/**
 * Initialize the widget menu
 */
WidgetManager.prototype._init_menu = function() {

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

    widgetsSubmenu.appendChild(this._createMenuItem('Save notebook with snapshots', this.buildSnapshotsAction));
    widgetsSubmenu.appendChild(this._createMenuItem('Download widget state', saveState.action));
    widgetsSubmenu.appendChild(this._createMenuItem('Embed widgets', embedWidgets.action));
};

/**
 * Creates a menu item for an action.
 * @param  {string} title - display string for the menu item
 * @param  {Action} action
 * @return {HTMLElement} menu item
 */
WidgetManager.prototype._createMenuItem = function(title, action) {
    var item = document.createElement('li');
    item.setAttribute('title', action.help);

    var itemLink = document.createElement('a');
    itemLink.setAttribute('href', '#');
    itemLink.innerText = title;
    item.appendChild(itemLink);

    item.onclick = action.handler;
    return item;
};

WidgetManager.prototype.display_model = function(msg, model, options) {
    options = options || {};
    if (msg) {
        var cell = this.get_msg_cell(msg.parent_header.msg_id);
        if (cell === null) {
            return Promise.reject(new Error("Could not determine where the display" +
                " message was from.  Widget will not be displayed"));
        } else {
            options.cell = cell; // TODO: Handle in get state
            // Only set cell_index when view is displayed as directly.
            options.cell_index = this.notebook.find_cell_index(cell);

            return widgets.ManagerBase.prototype.display_model.call(this, msg, model, options)
                .catch(widgets.reject('Could not display model', true));
        }
    } else if (options && options.cell_index !== undefined) {
        options.cell = this.notebook.get_cell(options.cell_index);
        return widgets.ManagerBase.prototype.display_model.call(this, msg, model, options)
            .catch(widgets.reject('Could not display model', true));
    } else {
        return Promise.reject(new Error("Could not determine which cell the " +
        "widget belongs to.  Widget will not be displayed"));
    }
};

// In display view
WidgetManager.prototype.display_view = function(msg, view, options) {
    if (options.cell === null) {
        view.remove();
        return Promise.reject(new Error("Could not determine where the display" +
            " message was from.  Widget will not be displayed"));
    } else {
        if (options.cell.widgetarea) {
            var that = this;
            return options.cell.widgetarea.display_widget_view(Promise.resolve(view)).then(function(view) {
                that._handle_display_view(view);
                return view;
            }).catch(widgets.reject('Could not display view', true));
        } else {
            return Promise.reject(new Error('Cell does not have a `widgetarea` defined'));
        }
    }
};

WidgetManager.prototype.filterViewOptions = function (options) {
    return {
        cell_index : options.cell_index
    };
};

WidgetManager.prototype.setViewOptions = function (options) {
    var options = options || {};
    // If a view is passed into the method, use that view's cell as
    // the cell for the view that is created.
    if (options.parent !== undefined) {
        options.cell = options.parent.options.cell;
    }
    return options;
};

WidgetManager.prototype.get_msg_cell = function (msg_id) {
    var cell = null;
    // First, check to see if the msg was triggered by cell execution.
    if (this.notebook) {
        cell = this.notebook.get_msg_cell(msg_id);
    }
    if (cell !== null) {
        return cell;
    }
    // Second, check to see if a get_cell callback was defined
    // for the message.  get_cell callbacks are registered for
    // widget messages, so this block is actually checking to see if the
    // message was triggered by a widget.
    var kernel = this.comm_manager.kernel;
    if (kernel) {
        var callbacks = kernel.get_callbacks_for_msg(msg_id);
        if (callbacks && callbacks.iopub &&
            callbacks.iopub.get_cell !== undefined) {
            return callbacks.iopub.get_cell();
        }
    }

    // Not triggered by a cell or widget (no get_cell callback
    // exists).
    return null;
};

/**
 * Updates rendered snapshots of all of the widget areas in the notebook.
 * @return {Promise<void>} success
 */
WidgetManager.prototype.updateSnapshots = function() {
    var that = this;
    var site = document.querySelector('#site');

    // Wait for the progress modal to show before continuing
    return this.progressModal.show().then(function() {
        // Disable overflow to prevent the document from having elements
        // that are scrolled out of visibility.
        site.style.overflow = 'visible';
        document.body.style.overflow = 'hidden';
        // Render the widgets of each cell.
        that._progress = 0;
        var cells = Jupyter.notebook.get_cells();
        return that._sequentialPromise(cells.map(that._updateCellSnapshots.bind(that)));
    }).then(function() {
        // When all of the rendering is complete, re-enable scrolling in the
        // notebook.
        site.style.overflow = '';
        document.body.style.overflow = '';
        // When the entire process has completed, hide the progress modal.
        return that.progressModal.hide();
    }).then(function() {
        // Reset the values of the modal
        that.progressModal.setText('Rendering widgets...');
        return that.progressModal.setValue(0);
    }).then(function() {
        // Invoke a notebook save
        Jupyter.menubar.actions.get('jupyter-notebook:save-notebook').handler({notebook: Jupyter.notebook});
    }).catch(widgets.reject('Could not create widget snapshots and save the notebook', true));
};

/**
 * Update the widget snapshots for a single cell
 * @param  {object} cell
 * @param  {number} index - of the cell
 * @return {Promise}
 */
WidgetManager.prototype._updateCellSnapshots = function(cell, index) {
    var that = this;
    var widgetSubarea = cell.element[0].querySelector(".widget-subarea");
    var cells = Jupyter.notebook.get_cells();
    if (!(widgetSubarea && widgetSubarea.children.length > 0)) {
        if (widgetSubarea && widgetSubarea.widgetSnapshot) {
            delete widgetSubarea.widgetSnapshot;
        }
        return that.progressModal.setValue(++that._progress/cells.length);
    }

    return that.progressModal.setText(
        'Rendering widget ' + String(index + 1) + '/' + String(cells.length) + ' ...'
    ).then(function() {
        return Promise.all([
            that._rasterizeEl(widgetSubarea),
            that._getCellWidgetStates(cell, index),
        ]);
    }).then(function(results) {
        var canvas = results[0];
        var widgetState = results[1];
        // Remove URL information, so only the b64 encoded data
        // exists, because that's what the notebook likes.
        var imageMimetype = 'image/png';
        var imageDataUrl = canvas.toDataURL(imageMimetype);
        var imageData = imageDataUrl.split(',').slice(-1)[0];

        // Create a mime bundle.
        var bundle = {};
        bundle[imageMimetype] = imageData;
        bundle['text/html'] = widgets.generateEmbedScript(widgetState, imageDataUrl);
        widgetSubarea.widgetSnapshot = bundle;
    }).then(function() {
        return that.progressModal.setValue(++that._progress/cells.length);
    });
};

WidgetManager.prototype._getCellWidgetStates = function(cell, index) {
    var that = this;
    var modelIds = Object.keys(this._models);
    return Promise.all(modelIds.map(function(modelId) {
        return that._models[modelId].then(function(model) {
            return widgets.resolvePromisesDict(model.views).then(function(views) {
                if (Object.keys(views).some(function(k) {
                    return views[k].options.cell_index == index;
                })) {
                    return that._traverseWidgetTree(model)
                        .map(function(widget) {
                            return widget.get_state(true);
                        });
                }
                return [null];
            });
        });
    })).then(function(states) {
        return states
            .reduce(function(a, b) { return a.concat(b); }, [])
            .filter(function(state) { return state !== null; });
    });
};

WidgetManager.prototype._traverseWidgetTree = function(parentWidget, cache) {
    // Setup a cache if it doesn't already exist
    if (!cache) {
        cache = {};
    }

    // Don't continue if this widget has already been traversed
    if (parentWidget.id in cache) {
        return [];
    }

    // Remember that this widget has been traversed
    cache[parentWidget.id] = true;

    // Traverse the parent widget's state for child widgets
    var state = parentWidget.get_state(true);
    var subWidgets = this._traverseWidgetState(state);
    var that = this;
    return _.flatten(subWidgets.map(function(subWidget) {
        return that._traverseWidgetTree(subWidget, cache);
    })).concat([ parentWidget ]);
};

WidgetManager.prototype._traverseWidgetState = function(state) {
    var that = this;
    if (state instanceof widgets.WidgetModel) {
        return [state];
    } else if (_.isArray(state)) {
        return _.flatten(state.map(this._traverseWidgetState.bind(this)));
    } else if (state instanceof Object) {
        var states = [];
        _.each(state, function(value, key) {
            states.push(that._traverseWidgetState(value));
        });
        return _.flatten(states);
    } else {
        return [];
    }
};

/**
 * Create a sequentially executed promise chain from an array of promises.
 * @param  {Array<Promise>} promises
 * @return {Promise}
 */
WidgetManager.prototype._sequentialPromise = function(promises) {
    var chain = Promise.resolve();
    promises.forEach(function(promise) {
        chain = chain.then(function() {
            return promise;
        });
    });
    return chain;
};

/**
 * Rasterize an HTMLElement to and HTML5 canvas
 * @param  {HTMLElement} el
 * @return {Promise<HTMLCanvasElement>}
 */
WidgetManager.prototype._rasterizeEl = function(el) {
    return new Promise(function(resolve) {
        html2canvas(el, {
            onrendered: function(canvas) {
                resolve(canvas);
            }
        });
    });
};


/**
 * Render the widget views that are live as images and prepend them as
 * outputs.
 *
 * Note: This function must be synchronous, in order to work with the
 * notebook's save machinery.
 */
WidgetManager.prototype.prependSnapshots = function() {
    var cells = Jupyter.notebook.get_cells();
    cells.forEach((function(cell) {
        var widgetSubarea = cell.element[0].querySelector(".widget-subarea");
        if (widgetSubarea && widgetSubarea.children.length > 0 && widgetSubarea.widgetSnapshot) {
            // Create an output for the screenshot.
            var output = {
                data: widgetSubarea.widgetSnapshot,
                output_type: "display_data",
                metadata: {isWidgetSnapshot: true}
            };

            // Move the new output to the top, so it appears
            // where the widget area appears.
            var outputState = cell.output_area.outputs;
            outputState.splice(0,0,output);
            cell.output_area.outputs = outputState;
        }
    }).bind(this));
};

/**
 * Remove the outputs that rendered widget view's.
 *
 * Note: This function must be synchronous, in order to work with the
 * notebook's save machinery.
 */
WidgetManager.prototype.deleteSnapshots = function() {
    var cells = Jupyter.notebook.get_cells();
    cells.forEach((function(cell) {

        // Remove the outputs with isWidgetSnapshot: true.
        if (cell.output_area) {
            // Filter out outputs that are snapshots
            // Only touch the data, not the page
            cell.output_area.outputs = cell.output_area.outputs.filter(function (output) {
                return !(output.metadata && output.metadata.isWidgetSnapShot);
            });

            // Remove the corresponding elements from the page
            cell.output_area.element
              .find('img.jupyter-widget')
              .each(function (index, el) {
                el.remove();
              });
        }
    }).bind(this));
};

WidgetManager.prototype._create_comm = function(comm_target_name, model_id, data) {
    var that = this;
    return this._get_connected_kernel().then(function(kernel) {
        if (data) {
            return kernel.comm_manager.new_comm(comm_target_name, data,
                                                that.callbacks(), {}, model_id);
        } else {
            return new Promise(function(resolve) {
                requirejs(["services/kernels/comm"], function(comm) {
                    var new_comm = new comm.Comm(comm_target_name, model_id);
                    kernel.comm_manager.register_comm(new_comm);
                    resolve(new_comm);
                });
            });
        }
    });
};


WidgetManager.prototype.callbacks = function (view) {
    /**
     * callback handlers specific a view
     */
    var callbacks = {};
    if (view && view.options.cell) {

        // Try to get output handlers
        var cell = view.options.cell;
        var handle_output = null;
        var handle_clear_output = null;
        if (cell.output_area) {
            handle_output = _.bind(cell.output_area.handle_output, cell.output_area);
            handle_clear_output = _.bind(cell.output_area.handle_clear_output, cell.output_area);
        }

        // Create callback dictionary using what is known
        var that = this;
        callbacks = {
            iopub : {
                output : handle_output,
                clear_output : handle_clear_output,

                // Special function only registered by widget messages.
                // Allows us to get the cell for a message so we know
                // where to add widgets if the code requires it.
                get_cell : function () {
                    return cell;
                },
            },
        };
    }
    return callbacks;
};


WidgetManager.prototype._get_comm_info = function() {
    /**
     * Gets a promise for the valid widget models.
     */
    var that = this;
    return this._get_connected_kernel().then(function(kernel) {
        return new Promise(function(resolve, reject) {
            kernel.comm_info('jupyter.widget', function(msg) {
                resolve(msg['content']['comms']);
            });
        });
    });
};

WidgetManager.prototype._get_connected_kernel = function() {
    /**
     * Gets a promise for a connected kernel
     */
    var that = this;
    return new Promise(function(resolve, reject) {
        if (that.comm_manager &&
            that.comm_manager.kernel &&
            that.comm_manager.kernel.is_connected()) {

            resolve(that.comm_manager.kernel);
        } else {
            that.notebook.events.on('kernel_connected.Kernel', function(event, data) {
                resolve(data.kernel);
            });
        }
    });
};

module.exports = {
    WidgetManager: WidgetManager
};
