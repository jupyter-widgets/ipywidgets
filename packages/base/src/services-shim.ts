// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * This module defines shims for @jupyterlab/services that allows you to use the
 * old comm API.  Use this, @jupyterlab/services, and the widget base manager to
 * embed live widgets in a context outside of the notebook.
 */

import * as utils from './utils';
import {
    Kernel
} from '@jupyterlab/services';

export
namespace shims {
    export
    namespace services {
        /**
         * Public constructor
         * @param jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
         */
        export
        class CommManager {
            constructor(jsServicesKernel: Kernel.IKernel) {
                this.init_kernel(jsServicesKernel);
            };

            /**
             * Hookup kernel events.
             * @param  {Kernel.IKernel} jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
             */
            init_kernel(jsServicesKernel) {
                this.kernel = jsServicesKernel; // These aren't really the same.
                this.jsServicesKernel = jsServicesKernel;
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
            new_comm(target_name: string, data: any, callbacks: any, metadata: any, comm_id: string): Comm {
                var comm = new Comm(this.jsServicesKernel.connectToComm(target_name, comm_id));
                this.register_comm(comm);
                comm.open(data, callbacks, metadata);
                return comm;
            };

            /**
             * Register a comm target
             * @param  {string} target_name
             * @param  {(Comm, object) => void} f - callback that is called when the
             *                         comm is made.  Signature of f(comm, msg).
             */
            register_target (target_name, f) {
                var handle = this.jsServicesKernel.registerCommTarget(target_name,
                (jsServicesComm, msg) => {
                    // Create the comm.
                    var comm = new Comm(jsServicesComm);
                    this.register_comm(comm);

                    // Call the callback for the comm.
                    try {
                        return f(comm, msg);
                    } catch (e) {
                        comm.close();
                        console.error(e);
                        console.error(new Error('Exception opening new comm'));
                    }
                });
                this.targets[target_name] = handle;
            };

            /**
             * Unregisters a comm target
             * @param  {string} target_name
             */
            unregister_target (target_name, f) {
                var handle = this.targets[target_name];
                handle.dispose();
                delete this.targets[target_name];
            };

            /**
             * Register a comm in the mapping
             */
            register_comm = function (comm) {
              this.comms[comm.comm_id] = Promise.resolve(comm);
              comm.kernel = this.kernel;
              return comm.comm_id;
            };

            targets = Object.create(null);
            comms = Object.create(null);
            kernel: Kernel.IKernel = null;
            jsServicesKernel: Kernel.IKernel = null;
        }

        /**
         * Public constructor
         * @param  {IComm} jsServicesComm - @jupyterlab/services IComm instance
         */
        export
        class Comm {
            constructor(jsServicesComm: Kernel.IComm) {
                this.jsServicesComm = jsServicesComm;
            }

            /**
             * Comm id
             * @return {string}
             */
            get comm_id() {
                return this.jsServicesComm.commId;
            }

            /**
             * Target name
             * @return {string}
             */
            get target_name() {
                return this.jsServicesComm.targetName;
            }

            /**
             * Opens a sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            open(data: any, callbacks: any, metadata: any): string {
                var future = this.jsServicesComm.open(data, metadata);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };

            /**
             * Sends a message to the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @param  buffers
             * @return message id
             */
            send(data: any, callbacks: any, metadata: any, buffers: ArrayBuffer[] | ArrayBufferView[]): string {
                var future = this.jsServicesComm.send(data, metadata, buffers);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };

            /**
             * Closes the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            close(data?: any, callbacks?: any, metadata?: any): string {
                var future = this.jsServicesComm.close(data, metadata);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };

            /**
             * Register a message handler
             * @param  callback, which is given a message
             */
            on_msg(callback: (x: any) => void): void {
                this.jsServicesComm.onMsg = callback.bind(this);
            };

            /**
             * Register a handler for when the comm is closed by the backend
             * @param  callback, which is given a message
             */
            on_close(callback: (x: any) => void): void {
                this.jsServicesComm.onClose = callback.bind(this);
            };

            /**
             * Hooks callback object up with @jupyterlab/services IKernelFuture
             * @param  @jupyterlab/services IKernelFuture instance
             * @param  callbacks
             */
            _hookupCallbacks(future: Kernel.IFuture, callbacks: any) {
                if (callbacks) {
                    future.onReply = function(msg) {
                        if (callbacks.shell && callbacks.shell.reply) callbacks.shell.reply(msg);
                        // TODO: Handle payloads.  See https://github.com/jupyter/notebook/blob/master/notebook/static/services/kernels/kernel.js#L923-L947
                    };

                    future.onStdin = function(msg) {
                        if (callbacks.input) callbacks.input(msg);
                    };

                    future.onIOPub = function(msg) {
                        if(callbacks.iopub) {
                            if (callbacks.iopub.status && msg.header.msg_type === 'status') {
                                callbacks.iopub.status(msg);
                            } else if (callbacks.iopub.clear_output && msg.header.msg_type === 'clear_output') {
                                callbacks.iopub.clear_output(msg);
                            } else if (callbacks.iopub.output) {
                                switch(msg.header.msg_type) {
                                    case 'display_data':
                                    case 'execute_result':
                                        callbacks.iopub.output(msg);
                                        break;
                                };
                            }
                        }
                    };
                }
            };

            jsServicesComm: Kernel.IComm = null;
        }
    }
}
