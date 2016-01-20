// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * This module defines shims for jupyter-js-services that allows you to use the
 * old comm API.  Use this, jupyter-js-services, and the widget base manager to
 * embed live widgets in a context outside of the notebook.
 */

define([
    'jquery',
    './utils',
    'underscore',
], function($, utils, _) {
    "use strict";

    /**
     * Public constructor
     * @param  {IKernel} jsServicesKernel - jupyter-js-services IKernel instance
     */
    var CommManager = function(jsServicesKernel) {
        this.targets = {};
        this.init_kernel(jsServicesKernel);
    };

    /**
     * Handles when a comm, without a target module, connects.
     * @param  {object} content - msg content
     * @return {Comm}
     */
    CommManager.prototype._handle_comm_connect = function(kernel, msg) {
        var targetName = msg.content.target_name;

        // Get the target from the registry.
        var target = this.targets[targetName];
        if (target === undefined) {
            console.error('Comm target "'  + targetName + '" not registered');
            return;
        }

        // Create the comm.
        var comm = new Comm(this.jsServicesKernel.connectToComm(targetName, msg.content.comm_id));

        // Call the callback for the comm.
        try {
            var response = target(comm, msg);
        } catch (e) {
            comm.close();
            var wrapped_error = new utils.WrappedError("Exception opening new comm", e);
            console.error(wrapped_error);
            return;
        }

        return comm;
    };

    /**
     * Hookup kernel events.
     * @param  {IKernel} jsServicesKernel - jupyter-js-services IKernel instance
     */
    CommManager.prototype.init_kernel = function(jsServicesKernel) {
        this.kernel = jsServicesKernel; // These aren't really the same.
        this.jsServicesKernel = jsServicesKernel;
        this.jsServicesKernel.commOpened.connect(_.bind(this._handle_comm_connect, this));
    };

    /**
     * Creates a new connected comm
     * @param  {string} target_name
     * @param  {object} data
     * @param  {object} callbacks
     * @param  {object} metadata
     * @param  {string} comm_id
     * @return {Comm}
     */
    CommManager.prototype.new_comm = function(target_name, data, callbacks, metadata, comm_id) {
        var comm = new Comm(this.jsServicesKernel.connectToComm(target_name, comm_id));
        comm.open(data, callbacks, metadata);
        return comm;
    };

    /**
     * Register a comm target
     * @param  {string} target_name
     * @param  {(Comm, object) => void} f - callback that is called when the
     *                         comm is made.  Signature of f(comm, msg).
     */
    CommManager.prototype.register_target = function (target_name, f) {
        this.targets[target_name] = f;
    };

    /**
     * Unregisters a comm target
     * @param  {string} target_name
     */
    CommManager.prototype.unregister_target = function (target_name, f) {
        delete this.targets[target_name];
    };



    /**
     * Public constructor
     * @param  {IComm} jsServicesComm - jupyter-js-services IComm instance
     */
    var Comm = function(jsServicesComm) {
        this.jsServicesComm = jsServicesComm;
    };

    /**
     * Comm id
     * @return {string}
     */
    Object.defineProperty(Comm.prototype, 'comm_id', {
        get: function() {
            return this.jsServicesComm.commId;
        }
    });

    /**
     * Target name
     * @return {string}
     */
    Object.defineProperty(Comm.prototype, 'target_name', {
        get: function() {
            return this.jsServicesComm.targetName;
        }
    });

    /**
     * Opens a sibling comm in the backend
     * @param  {object} data
     * @param  {object} callbacks
     * @param  {object} metadata
     * @return {string} msg id
     */
    Comm.prototype.open = function (data, callbacks, metadata) {
        var future = this.jsServicesComm.open(data, metadata);
        this._hookupCallbacks(future, callbacks);
        return future.msgId;
    };

    /**
     * Sends a message to the sibling comm in the backend
     * @param  {object} data
     * @param  {object} callbacks
     * @param  {object} metadata
     * @param  {(ArrayBuffer | ArrayBufferView)[]} buffers
     * @return {string} msg id
     */
    Comm.prototype.send = function (data, callbacks, metadata, buffers) {
        var future = this.jsServicesComm.send(data, metadata, buffers);
        this._hookupCallbacks(future, callbacks);
        return future.msgId;
    };

    /**
     * Closes the sibling comm in the backend
     * @param  {object} data
     * @param  {object} callbacks
     * @param  {object} metadata
     * @return {string} msg id
     */
    Comm.prototype.close = function (data, callbacks, metadata) {
        var future = this.jsServicesComm.close(data, metadata);
        this._hookupCallbacks(future, callbacks);
        return future.msgId;
    };

    /**
     * Register a message handler
     * @param  {(object) => void} callback - signature of f(msg)
     */
    Comm.prototype.on_msg = function (callback) {
        this.jsServicesComm.onMsg = callback.bind(this);
    };

    /**
     * Register a handler for when the comm is closed by the backend
     * @param  {(object) => void} callback - signature of f(msg)
     */
    Comm.prototype.on_close = function (callback) {
        this.jsServicesComm.onClose = callback.bind(this);
    };

    /**
     * Hooks callback object up with jupyter-js-services IKernelFuture
     * @param  {IKernelFuture} future - jupyter-js-services IKernelFuture instance
     * @param  {object} callbacks
     */
    Comm.prototype._hookupCallbacks = function(future, callbacks) {
        if (callbacks) {
            future.onReply = function(msg) {
                if (callbacks.shell && callbacks.shell.reply) callbacks.shell.reply(msg);
                // TODO: Handle payloads.  See https://github.com/jupyter/notebook/blob/master/notebook/static/services/kernels/kernel.js#L923-L947
            };

            future.onStdin = function(msg) {
                if (callbacks.input) callbacks.input(msg);
            };

            future.onIOPub = function(msg) {
                if (callbacks.iopub && callbacks.iopub.status) callbacks.iopub.status(msg);
                if (callbacks.iopub && callbacks.iopub.clear_output) callbacks.iopub.clear_output(msg);
                if (callbacks.iopub && callbacks.iopub.output) callbacks.iopub.output(msg);
            };
        }
    };

    return {
        'CommManager': CommManager,
        'Comm': Comm
    };
});
