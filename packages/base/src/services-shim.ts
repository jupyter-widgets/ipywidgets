// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * This module defines shims for @jupyterlab/services that allows you to use the
 * old comm API.  Use this, @jupyterlab/services, and the widget base manager to
 * embed live widgets in a context outside of the notebook.
 */

import { Kernel, KernelMessage } from '@jupyterlab/services';
import type { JSONValue, JSONObject } from '@lumino/coreutils';

/**
 * Callbacks for services shim comms.
 */
export interface ICallbacks {
  shell?: { [key: string]: (msg: KernelMessage.IShellMessage) => void };
  iopub?: { [key: string]: (msg: KernelMessage.IIOPubMessage) => void };
  input?: (msg: KernelMessage.IStdinMessage) => void;
}

export interface IClassicComm {
  /**
   * Comm id
   * @return {string}
   */
  comm_id: string;

  /**
   * Target name
   * @return {string}
   */
  target_name: string;

  /**
   * Opens a sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return msg id
   */
  open(
    data: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string;

  /**
   * Sends a message to the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return message id
   */
  send(
    data: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string;

  /**
   * Closes the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return msg id
   */
  close(
    data?: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string;

  /**
   * Register a message handler
   * @param  callback, which is given a message
   */
  on_msg(callback: (x: any) => void): void;

  /**
   * Register a handler for when the comm is closed by the backend
   * @param  callback, which is given a message
   */
  on_close(callback: (x: any) => void): void;
}

export namespace shims {
  export namespace services {
    /**
     * Public constructor
     * @param jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
     */
    export class CommManager {
      constructor(jsServicesKernel: Kernel.IKernelConnection) {
        this.init_kernel(jsServicesKernel);
      }

      /**
       * Hookup kernel events.
       * @param  {Kernel.IKernel} jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
       */
      init_kernel(jsServicesKernel: Kernel.IKernelConnection): void {
        this.kernel = jsServicesKernel; // These aren't really the same.
        this.jsServicesKernel = jsServicesKernel;
      }

      /**
       * Creates a new connected comm
       */
      async new_comm(
        target_name: string,
        data: any,
        callbacks: any,
        metadata: any,
        comm_id: string,
        buffers?: ArrayBuffer[] | ArrayBufferView[]
      ): Promise<Comm> {
        const c = this.jsServicesKernel.createComm(target_name, comm_id);
        const comm = new Comm(c);
        this.register_comm(comm);
        comm.open(data, callbacks, metadata, buffers);
        return comm;
      }

      /**
       * Register a comm target
       * @param  {string} target_name
       * @param  {(Comm, object) => void} f - callback that is called when the
       *                         comm is made.  Signature of f(comm, msg).
       */
      register_target(
        target_name: string,
        f: (comm: Comm, object: KernelMessage.IMessage) => void
      ): void {
        const handle = this.jsServicesKernel.registerCommTarget(
          target_name,
          (jsServicesComm, msg) => {
            // Create the comm.
            const comm = new Comm(jsServicesComm);
            this.register_comm(comm);

            // Call the callback for the comm.
            try {
              return f(comm, msg);
            } catch (e) {
              comm.close();
              console.error(e);
              console.error(new Error('Exception opening new comm'));
            }
          }
        );
        this.targets[target_name] = handle;
      }

      /**
       * Unregisters a comm target
       * @param  {string} target_name
       */
      unregister_target(
        target_name: string,
        f: (comm: Comm, object: KernelMessage.IMessage) => void
      ): void {
        const handle = this.targets[target_name];
        handle.dispose();
        delete this.targets[target_name];
      }

      /**
       * Register a comm in the mapping
       */
      register_comm(comm: Comm): string {
        this.comms[comm.comm_id] = Promise.resolve(comm);
        comm.kernel = this.kernel;
        return comm.comm_id;
      }

      targets = Object.create(null);
      comms = Object.create(null);
      kernel: Kernel.IKernelConnection;
      jsServicesKernel: Kernel.IKernelConnection;
    }

    /**
     * Public constructor
     * @param  {IComm} jsServicesComm - @jupyterlab/services IComm instance
     */
    export class Comm implements IClassicComm {
      constructor(jsServicesComm: Kernel.IComm) {
        this.jsServicesComm = jsServicesComm;
      }

      /**
       * Comm id
       * @return {string}
       */
      get comm_id(): string {
        return this.jsServicesComm.commId;
      }

      /**
       * Target name
       * @return {string}
       */
      get target_name(): string {
        return this.jsServicesComm.targetName;
      }

      /**
       * Opens a sibling comm in the backend
       * @param  data
       * @param  callbacks
       * @param  metadata
       * @return msg id
       */
      open(
        data: JSONValue,
        callbacks?: ICallbacks,
        metadata?: JSONObject,
        buffers?: ArrayBuffer[] | ArrayBufferView[]
      ): string {
        const future = this.jsServicesComm.open(data, metadata, buffers);
        this._hookupCallbacks(future, callbacks);
        return future.msg.header.msg_id;
      }

      /**
       * Sends a message to the sibling comm in the backend
       * @param  data
       * @param  callbacks
       * @param  metadata
       * @param  buffers
       * @return message id
       */
      send(
        data: JSONValue,
        callbacks?: ICallbacks,
        metadata?: JSONObject,
        buffers?: ArrayBuffer[] | ArrayBufferView[]
      ): string {
        const future = this.jsServicesComm.send(data, metadata, buffers);
        this._hookupCallbacks(future, callbacks);
        return future.msg.header.msg_id;
      }

      /**
       * Closes the sibling comm in the backend
       * @param  data
       * @param  callbacks
       * @param  metadata
       * @return msg id
       */
      close(
        data?: JSONValue,
        callbacks?: ICallbacks,
        metadata?: JSONObject,
        buffers?: ArrayBuffer[] | ArrayBufferView[]
      ): string {
        const future = this.jsServicesComm.close(data, metadata, buffers);
        this._hookupCallbacks(future, callbacks);
        return future.msg.header.msg_id;
      }

      /**
       * Register a message handler
       * @param  callback, which is given a message
       */
      on_msg(callback: (x: any) => void): void {
        this.jsServicesComm.onMsg = callback.bind(this);
      }

      /**
       * Register a handler for when the comm is closed by the backend
       * @param  callback, which is given a message
       */
      on_close(callback: (x: any) => void): void {
        this.jsServicesComm.onClose = callback.bind(this);
      }

      /**
       * Hooks callback object up with @jupyterlab/services IKernelFuture
       * @param  @jupyterlab/services IKernelFuture instance
       * @param  callbacks
       */
      _hookupCallbacks(
        future: Kernel.IShellFuture,
        callbacks?: ICallbacks
      ): void {
        if (callbacks) {
          future.onReply = function (msg): void {
            if (callbacks.shell && callbacks.shell.reply) {
              callbacks.shell.reply(msg);
            }
          };

          future.onStdin = function (msg): void {
            if (callbacks.input) {
              callbacks.input(msg);
            }
          };

          future.onIOPub = function (msg): void {
            if (callbacks.iopub) {
              if (callbacks.iopub.status && msg.header.msg_type === 'status') {
                callbacks.iopub.status(msg);
              } else if (
                callbacks.iopub.clear_output &&
                msg.header.msg_type === 'clear_output'
              ) {
                callbacks.iopub.clear_output(msg);
              } else if (callbacks.iopub.output) {
                switch (msg.header.msg_type) {
                  case 'display_data':
                  case 'execute_result':
                  case 'stream':
                  case 'error':
                    callbacks.iopub.output(msg);
                    break;
                  default:
                    break;
                }
              }
            }
          };
        }
      }

      jsServicesComm: Kernel.IComm;
      kernel: Kernel.IKernelConnection;
    }
  }
}
