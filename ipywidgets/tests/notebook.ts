// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import iwidgetcasper = require('./iwidgetcasper');

/**
 * Represents a Notebook used for testing.
 */
export class Notebook {    
    private _tester: iwidgetcasper.WidgetCasper;
    private _cell_index: number;
    private _cells: string[];
    private _cell_outputs: string[][];
    private _cell_outputs_errors: string[][];

    public constructor(tester: iwidgetcasper.WidgetCasper) {
        this._cell_index = 0;
        this._cells = [];
        this._cell_outputs = [];
        this._cell_outputs_errors = [];

        this._tester = tester
        this._open_new_notebook();
    }

    /**
     * Index of the last appended cell.
     */
    public get cell_index(): number {
        return this._cell_index;
    }

    /**
     * Is the notebook busy
     */
    public is_busy(): boolean {
        return this._tester.evaluate(function () {
            return IPython._status === 'busy';
        });
    }

    /**
     * Is the notebook idle
     */
    public is_idle(): boolean {
        return this._tester.evaluate(function () {
            return IPython._status === 'idle';
        });
    }

    /**
     * Does a cell have output
     */
    public has_output(cell_index: number, output_index: number=0): boolean {
        return this._tester.evaluate(function get_output(c, o) {
            var cell = IPython.notebook.get_cell(c);
            return cell.output_area.outputs.length > o;
        }, {c : cell_index, o : output_index});
    }

    /**
     * Get the output of a cell
     */
    public get_output(cell_index: number, output_index: number=0): any {
        return this._tester.evaluate(function get_output(c, o) {
            var cell = IPython.notebook.get_cell(c);
            if (cell.output_area.outputs.length > o) {
                return cell.output_area.outputs[o];
            } else {
                return undefined;
            }
        }, {c : cell_index, o : output_index});
    }

    /**
     * Get the cell execution cached outputs.
     */
    public get_cached_outputs(cell_index: number): any[] {
        return this._cell_outputs[cell_index];
    }

    /**
     * Get the cell execution cached output errors.
     */
    public get_cached_output_errors(cell_index: number): any[] {
        return this._cell_outputs_errors[cell_index];
    }

    /**
     * Check if an element exists in a cell.
     */
    public cell_element_exists(cell_index: number, selector: string): boolean {
        return this._tester.evaluate(function (c, s) {
            var $cell = IPython.notebook.get_cell(c).element;
            return $cell.find(s).length > 0;
        }, cell_index, selector);
    }

    /**
     * Utility function that allows us to execute a jQuery function 
     * on an element within a cell.
     */
    public cell_element_function(cell_index: string, selector: string, function_name: string, function_args: any[]): any {
        return this._tester.evaluate(function (c, s, f, a) {
            var $cell = IPython.notebook.get_cell(c).element;
            var $el = $cell.find(s);
            return $el[f].apply($el, a);
        }, cell_index, selector, function_name, function_args);
    }

    /**
     * Get the URL for the notebook server.
     */
    public get_notebook_server(): string {
        // Get the URL of a notebook server on which to run tests.
        var port = this._tester.cli.get("port");
        port = (typeof port === 'undefined') ? '8888' : port;
        return this._tester.cli.get("url") || ('http://127.0.0.1:' + port);
    }

    /**
     * Append a cell to the notebook
     * @return cell index
     */
    public append_cell(contents: string, cell_type: string): number {

        // Inserts a cell at the bottom of the notebook
        // Returns the new cell's index.
        let index: number = this._tester.evaluate(function (t: string, c: string){
            var cell: any = IPython.notebook.insert_cell_at_bottom(t);
            cell.set_text(c);
            return IPython.notebook.find_cell_index(cell);
        }, cell_type, contents);

        // Increment the logged cell index.
        this._cell_index++;
        this._cells.push(contents);
        return index;
    }

    /**
     * Get an appended cell's contents.
     * @return contents
     */
    public get_cell(index: number): string {
        return this._cells[index];
    }

    /**
     * Execute a cell
     * @param index
     * @param expect_error - expect an error to occur when running the cell
     */
    public execute_cell(index: number, expect_error: boolean=false): void {
        this._tester.then(()=>{
            this._tester.evaluate(function (index) {
                var cell = IPython.notebook.get_cell(index);
                cell.execute();
            }, index);
        });
        this._tester.wait_for_idle();

        // Check for errors.
        this._tester.then(() => {
            var nonerrors = this._tester.evaluate(function (index) {
                var cell = IPython.notebook.get_cell(index);
                var outputs = cell.output_area.outputs;
                var nonerrors = [];
                for (var i = 0; i < outputs.length; i++) {
                    if (outputs[i].output_type !== 'error') {
                        nonerrors.push(outputs[i]);
                    }
                }
                return nonerrors;
            }, index);
            this._cell_outputs.push(nonerrors);

            var errors = this._tester.evaluate(function (index) {
                var cell = IPython.notebook.get_cell(index);
                var outputs = cell.output_area.outputs;
                var errors = [];
                for (var i = 0; i < outputs.length; i++) {
                    if (outputs[i].output_type === 'error') {
                        errors.push(outputs[i]);
                    }
                }
                return errors;
            }, index);
            this._cell_outputs_errors.push(errors);

            var error = this._tester.evaluate(function (index) {
                var cell = IPython.notebook.get_cell(index);
                var outputs = cell.output_area.outputs;
                for (var i = 0; i < outputs.length; i++) {
                    if (outputs[i].output_type == 'error') {
                        return outputs[i];
                    }
                }
                return false;
            }, index);
            
            if (error === null) {
                this._tester.test.fail("Failed to check for error output");
            }
            
            if (!expect_error && error !== false) {
                this._tester.test.fail("Error running cell");
            }
            
            if (expect_error && error === false) {
                this._tester.test.fail("An error was expected but the cell didn't raise one");
            }
        });
    }

    /**
     * Opens a new notebook.
     */
    private _open_new_notebook(): void {
        // Create and open a new notebook.
        var baseUrl = this.get_notebook_server();
        this._tester.start(baseUrl);
        this._tester.waitFor(() => this._page_loaded());
        this._tester.waitForSelector('#kernel-python2 a, #kernel-python3 a');
        this._tester.thenClick('#kernel-python2 a, #kernel-python3 a');
        
        this._tester.waitForPopup('');

        this._tester.withPopup('', function () {this.waitForSelector('.CodeMirror-code');});
        this._tester.then(function () {
            this.open(this.popups[0].url);
        });
        this._tester.waitFor(() => this._page_loaded());

        // Make sure the kernel has started
        this._tester.waitFor(() => this._kernel_running());
        // track the IPython busy/idle state
        this._tester.thenEvaluate(function () {
            (<any>require)(['base/js/namespace', 'base/js/events'], function (IPython, events) {
            
                events.on('kernel_idle.Kernel',function () {
                    IPython._status = 'idle';
                });
                events.on('kernel_busy.Kernel',function () {
                    IPython._status = 'busy';
                });
            });
        });

        // Because of the asynchronous nature of SlimerJS (Gecko), we need to make
        // sure the notebook has actually been loaded into the IPython namespace
        // before running any tests.
        this._tester.waitFor(function() {
            return this.evaluate(function () {
                return IPython.notebook;
            });
        });
    }

    /**
     * Whether or not the page has loaded.
     */
    private _page_loaded(): boolean {
        // Return whether or not the kernel is running.
        return this._tester.evaluate(function() {
            return typeof IPython !== "undefined" &&
                IPython.page !== undefined;
        });
    }

    /**
     * Whether or not the kernel is running
     */
    private _kernel_running(): boolean {
        // Return whether or not the kernel is running.
        return this._tester.evaluate(function() {
            return IPython &&
            IPython.notebook &&
            IPython.notebook.kernel &&
            IPython.notebook.kernel.is_connected();
        });
    }
}
