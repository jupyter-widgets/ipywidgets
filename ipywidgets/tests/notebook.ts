import iwidgetcasper = require('./iwidgetcasper');

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

    public get cell_index(): number {
        return this._cell_index;
    }

    public is_busy(): boolean {
        return this._tester.evaluate(function () {
            return IPython._status === 'busy';
        });
    }

    public is_idle(): boolean {
        return this._tester.evaluate(function () {
            return IPython._status === 'idle';
        });
    }

    public has_output(cell_index: number, output_index: number=0): boolean {
        return this._tester.evaluate(function get_output(c, o) {
            var cell = IPython.notebook.get_cell(c);
            return cell.output_area.outputs.length > o;
        }, {c : cell_index, o : output_index});
    }

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

    public get_cached_outputs(cell_index: number): any[] {
        return this._cell_outputs[cell_index];
    }

    public get_cached_output_errors(cell_index: number): any[] {
        return this._cell_outputs_errors[cell_index];
    }

    // is_widget(widget_info: any): boolean;
    // is_element(index: number, selector: string): boolean;

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

    public get_notebook_server(): string {
        // Get the URL of a notebook server on which to run tests.
        var port = this._tester.cli.get("port");
        port = (typeof port === 'undefined') ? '8888' : port;
        return this._tester.cli.get("url") || ('http://127.0.0.1:' + port);
    }

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

    public get_cell(index: number): string {
        return this._cells[index];
    }

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

    private _page_loaded(): boolean {
        // Return whether or not the kernel is running.
        return this._tester.evaluate(function() {
            return typeof IPython !== "undefined" &&
                IPython.page !== undefined;
        });
    }

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
