/// <reference path="typings/notebook_test.d.ts" />

export interface WidgetCasper extends Casper {
    cell(text: string, callback?: (index?: number) => void): WidgetCasper;
    assert_output_equals(content: string, output_text: string, message: string): WidgetCasper;
    start_notebook_then(): WidgetCasper;
    stop_notebook_then(): WidgetCasper;
    wait_for_busy(): WidgetCasper;
    wait_for_idle(): WidgetCasper;
    wait_for_output(cell_num: number, out_num: number): WidgetCasper;
    wait_for_widget(widget_info: any): WidgetCasper;
    wait_for_element(index: number, selector: string): WidgetCasper;
    
    get_output_cell(cell_num: number, out_num: number): string;
    cell_element_exists(index: number, selector: string): boolean;
    cell_element_function(index: string, selector: string, function_name: string, function_args: any[]): any;
    interact(): void; // TODO
    
    _logs: string[][];
    _logs_errors: any[][];
    _cell_index: number;
    _cells: string[];
    _cell_outputs: string[];
    _cell_outputs_errors: string[];
    _printed_cells: number[];
    _init_events(): void; // TODO
    _open_new_notebook(): void;
    _get_notebook_server(): string;
    _page_loaded(): boolean;
    _kernel_running(): boolean;
    _header(section: string, border_style?: any): void;
    _body(section: string, body_style?: any, border_style?: any): void;

    colorizer: Colorizer;
    cli: { get: (name: string) => any; };
    on(evt: string, cb: (...args: any[])=>any): void;
    back(): WidgetCasper;
    capture(targetFilePath: string, clipRect: ClipRect): WidgetCasper;
    captureSelector(targetFile: string, selector: string): WidgetCasper;
    clear(): WidgetCasper;
    debugHTML(selector?: string, outer?: boolean): WidgetCasper;
    debugPage(): WidgetCasper;
    die(message: string, status?: number): WidgetCasper;
    download(url: string, target?: string, method?: string, data?: any): WidgetCasper;
    each<T>(array: T[], fn: (self: WidgetCasper, item: T, index: number) => void): WidgetCasper;
    echo(message: string, style?: string): WidgetCasper;
    evaluate(fn: (...args: any[]) => any, ...args: any[]): any;
    evaluateOrDie(fn: (...args: any[]) => any, message?: string, status?: number): WidgetCasper;
    exit(status?: number): WidgetCasper;
    forward(): WidgetCasper;
    log(message: string, level?: string, space?: string): WidgetCasper;
    open(location: string, settings: OpenSettings): WidgetCasper;
    reload(then?: (response: HttpResponse) => void): WidgetCasper;
    repeat(times: number, then: Function): WidgetCasper;
    run(onComplete: Function, time?: number): WidgetCasper;
    scrollTo(x: number, y: number): WidgetCasper;
    scrollToBottom(): WidgetCasper;
    sendKeys(selector: string, keys: string, options?: any): WidgetCasper;
    setHttpAuth(username: string, password: string): WidgetCasper;
    start(url?: string, then?: (response: HttpResponse) => void): WidgetCasper;
    then(fn: (self?: WidgetCasper) => void): WidgetCasper;
    thenBypass(nb: number): WidgetCasper;
    thenBypassIf(condition: any, nb: number): WidgetCasper;
    thenBypassUnless(condition: any, nb: number): WidgetCasper;
    thenClick(selector: string): WidgetCasper;
    thenEvaluate(fn: () => any, ...args: any[]): WidgetCasper;
    thenOpen(location: string, then?: (response: HttpResponse) => void): WidgetCasper;
    thenOpen(location: string, options?: OpenSettings, then?: (response: HttpResponse) => void): WidgetCasper;
    thenOpenAndEvaluate(location: string, then?: Function, ...args: any[]): WidgetCasper;
    unwait(): WidgetCasper;
    viewport(width: number, height: number): WidgetCasper;
    wait(timeout: number, then?: Function): WidgetCasper;
    waitFor(testFx: Function, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForAlert(then: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForPopup(urlPattern: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForPopup(urlPattern: RegExp, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForUrl(url: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForUrl(url: RegExp, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForSelector(selector: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitWhileSelector(selector: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForResource(testFx: Function, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForText(pattern: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitForText(pattern: RegExp, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitUntilVisible(selector: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    waitWhileVisible(selector: string, then?: Function, onTimeout?: Function, timeout?: number): WidgetCasper;
    warn(message: string): WidgetCasper;
    withFrame(frameInfo: string, then: Function): WidgetCasper;
    withFrame(frameInfo: number, then: Function): WidgetCasper;
    withPopup(popupInfo: string, step: Function): WidgetCasper;
    withPopup(popupInfo: RegExp, step: Function): WidgetCasper;
    zoom(factor: number): WidgetCasper;
}

export var tester: WidgetCasper = <WidgetCasper><any>casper;
// var colorizer = require('colorizer').create();

// Commandline Parameters
// port
// url
// log-all

tester.options.waitTimeout=1000;

tester.start_notebook_then = function(): WidgetCasper {

    // Wrap a notebook test to reduce boilerplate.
    this._open_new_notebook();

    // Echo whether or not we are running this test using SlimerJS
    if (this.evaluate(function(){
        return typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    })) { 
        console.log('This test is running in SlimerJS.'); 
        this.slimerjs = true;
    }
    
    // Make sure to remove the onbeforeunload callback.  This callback is 
    // responsible for the "Are you sure you want to quit?" type messages.
    // PhantomJS ignores these prompts, SlimerJS does not which causes hangs.
    this.then(function(){
        this.evaluate(function(){
            window.onbeforeunload = function(){};
        });
    });

    return this;
};

tester.stop_notebook_then = function(): WidgetCasper {
    
    // Kill the kernel.
    // Shut down the current notebook's kernel.
    this.thenEvaluate(function() {
        IPython.notebook.session.delete();
    });
    // We close the page right after this so we need to give it time to complete.
    this.wait(1000);
    
    // TODO: Delete the notebook.
    
    // This is required to clean up the page we just finished with. If we don't call this
    // casperjs will leak file descriptors of all the open WebSockets in that page. We
    // have to set this.page=null so that next time tester.start runs, it will create a
    // new page from scratch.
    this.then(function () {
        this.page.close();
        this.page = null;
    });
    
    // Run the browser automation.
    this.run(function() {
        this.test.done();
    });

    return this;
};

/**
 * Appends and exectues a cell.
 * @param contents
 * @param callback - function to callback when the cell has been executed.
 */
tester.cell = function(contents: string, callback?: (index?: number) => void, cell_type: string='code'): WidgetCasper {
    let lines: string[] = contents.split('\n');
    let indent: number = null;
    for (let line of lines) {
        if (line.trim().length !== 0) {
            let local_indent = contents.length - contents.replace(/^\s+/, '').length;
            if (indent === null || indent > local_indent) {
                indent = local_indent;
            }
        }
    }

    let new_lines: string[] = [];
    for (let line of lines) {
        // Compress by removing blank lines.
        if (line.trim().length > 0) {
            new_lines.push(line.substr(Math.max(0,indent-1)));
        }
    }
    contents = new_lines.join('\n');
    tester.then(() => {
        
        // Inserts a cell at the bottom of the notebook
        // Returns the new cell's index.
        let index: number = this.evaluate(function (cell_type: string, contents: string){
            var cell: any = IPython.notebook.insert_cell_at_bottom(cell_type);
            cell.set_text(contents);
            return IPython.notebook.find_cell_index(cell);
        }, cell_type, contents);

        // Increment the logged cell index.
        this._cell_index++;
        this._logs.push([]);
        this._logs_errors.push([]);
        this._cells.push(contents);

        // Synchronously execute a cell by index.
        this.then(()=>{
            this.evaluate(function (index) {
                var cell = IPython.notebook.get_cell(index);
                cell.execute();
            }, index);
        });
        this.wait_for_idle();
    
        // Check for errors.
        this.then(() => {
            var nonerrors = this.evaluate(function (index) {
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
            tester._cell_outputs.push(nonerrors);

            var errors = this.evaluate(function (index) {
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
            tester._cell_outputs_errors.push(errors);

            var error = this.evaluate(function (index) {
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
                this.test.fail("Failed to check for error output");
            }
            
            if (error !== false) {
                this.test.fail("Error running cell");
            }
        });

        // Call the callback if it's defined.
        if (callback!==undefined) {
            this.then(() => { 
                callback.apply(this, [index]);
            });
        }
    });

    return this;
};

tester.wait_for_busy = function (): WidgetCasper {
    // Waits for the notebook to enter a busy state.
    this.waitFor(function () {
        return this.evaluate(function () {
            return IPython._status == 'busy';
        });
    });
    return this;
};

tester.wait_for_idle = function (): WidgetCasper {
    // Waits for the notebook to idle.
    this.waitFor(function () {
        return this.evaluate(function () {
            return IPython._status == 'idle';
        });
    });
    return this;
};

tester.wait_for_output = function (cell_num: number, out_num: number): WidgetCasper {
    // wait for the nth output in a given cell
    this.wait_for_idle();
    out_num = out_num || 0;
    this.then(function() {
        this.waitFor(function (c, o) {
            return this.evaluate(function get_output(c, o) {
                var cell = IPython.notebook.get_cell(c);
                return cell.output_area.outputs.length > o;
            },
            // pass parameter from the test suite js to the browser code js
            {c : cell_num, o : out_num});
        });
    },
    function then() { },
    function timeout() {
        this.echo("wait_for_output timed out!");
    });
    return this;
};

tester.wait_for_widget = function(widget_info: any): WidgetCasper {
    // wait for a widget msg que to reach 0
    //
    // Parameters
    // ----------
    // widget_info : object
    //      Object which contains info related to the widget.  The model_id property
    //      is used to identify the widget.

    // Clear the results of a previous query, if they exist.  Make sure a
    // dictionary exists to store the async results in.
    this.thenEvaluate(function(model_id) {
        if (window.pending_msgs === undefined) { 
            window.pending_msgs = {}; 
        } else {
            window.pending_msgs[model_id] = -1;
        } 
    }, {model_id: widget_info.model_id});

    // Wait for the pending messages to be 0.
    this.waitFor(function () {
        var pending = this.evaluate(function (model_id) {

            // Get the model.  Once the model is had, store it's pending_msgs
            // count in the window's dictionary.
            IPython.notebook.kernel.widget_manager.get_model(model_id)
            .then(function(model) {     
                window.pending_msgs[model_id] = model.pending_msgs; 
            });

            // Return the pending_msgs result.
            return window.pending_msgs[model_id];
        }, {model_id: widget_info.model_id});

        if (pending === 0) {
            return true;
        } else {
            return false;
        }
    });
    return this;
};

tester.assert_output_equals = function(content: string, output_text: string, message: string): WidgetCasper {
    // Append a code cell with the content, then assert the output is equal to output_text
    this.cell(content, (index) => {
        this.test.assertEquals(this.get_output_cell(index).text.trim(), output_text, message);
    });
    return this;
};

tester.get_output_cell = function (cell_num: number, out_num: number): string {
    // return an output of a given cell
    out_num = out_num || 0;
    var result = tester.evaluate(function (c, o) {
        var cell = IPython.notebook.get_cell(c);
        return cell.output_area.outputs[o];
    },
    {c : cell_num, o : out_num});
    if (!result) {
        var num_outputs = tester.evaluate(function (c) {
            var cell = IPython.notebook.get_cell(c);
            return cell.output_area.outputs.length;
        },
        {c : cell_num});
        this.test.assertTrue(false,
            "Cell " + cell_num + " has no output #" + out_num + " (" + num_outputs + " total)"
        );
    } else {
        return result;
    }
};

tester.wait_for_element = function(index: number, selector: string): WidgetCasper {
    // Utility function that allows us to easily wait for an element 
    // within a cell.  Uses JQuery selector to look for the element.
    this.waitFor(() => this.cell_element_exists(index, selector));
    return this;
};

tester.cell_element_exists = function(index: number, selector: string): boolean {
    // Utility function that allows us to easily check if an element exists 
    // within a cell.  Uses JQuery selector to look for the element.
    return tester.evaluate(function (index, selector) {
        var $cell = IPython.notebook.get_cell(index).element;
        return $cell.find(selector).length > 0;
    }, index, selector);
};

tester.cell_element_function = function(index: string, selector: string, function_name: string, function_args: any[]): any {
    // Utility function that allows us to execute a jQuery function on an 
    // element within a cell.
    return tester.evaluate(function (index, selector, function_name, function_args) {
        var $cell = IPython.notebook.get_cell(index).element;
        var $el = $cell.find(selector);
        return $el[function_name].apply($el, function_args);
    }, index, selector, function_name, function_args);
};

tester._init_events = function(): void {
    // show captured errors
    var seen_errors = 0;
    var reset = () => {
        tester._logs = [[]];
        tester._logs_errors = [[]];
        tester._cell_index = 0;
        tester._cells = [];
        tester._printed_cells = [];
        tester._cell_outputs = [];
        tester._cell_outputs_errors = [];
    };
    reset();

    this.on('remote.message', (msg) => {
        this._logs[this._cell_index].push(msg);
    });

    this.on("page.error", function onError(msg: string, trace) {
        // show errors in the browser
        this.echo('Page error (recorded)', 'WARNING');

        let error = {
            text: msg,
            traceback: ''
        }

        var local_path = this._get_notebook_server();
        for (var i = 0; i < trace.length; i++) {
            var frame = trace[i];
            var file = frame.file;
            // shorten common phantomjs evaluate url
            // this will have a different value on slimerjs
            if (file === "phantomjs://webpage.evaluate()") {
                file = "evaluate";
            }
            // remove the version tag from the path
            file = file.replace(/(\?v=[0-9abcdef]+)/, '');
            // remove the local address from the beginning of the path
            if (file.indexOf(local_path) === 0) {
                file = file.substr(local_path.length);
            }
            var frame_text = (frame.function.length > 0) ? " in " + frame.function : "";
            error.traceback += "\n    line " + frame.line + " of " + file + frame_text;
        }

        tester._logs_errors[tester._cell_index].push(error);
    });

    // Outputs a cell log.
    var output_cell = (cell_index: number) => {
        var shown: boolean = (this._printed_cells.indexOf(cell_index) !== -1);
        if (!shown) this._printed_cells.push(cell_index);
        if (cell_index===0) {
            tester._header('Before cell(s)' + (shown ? ', see details above.' : ':'), { bg: 'yellow', fg: 'black', bold: true });
        } else {
            tester._header('While in cell ' + String(cell_index) + (shown ? ', see details above.' : ':'), { bg: 'yellow', fg: 'black', bold: true });
        }
        if (!shown || that._logs[cell_index].length !== 0 || that._logs_errors[cell_index].length !== 0) {


            if (cell_index!==0 && !shown) {
                tester._header('kernel');
                tester._body('in:', { bg: 'black', fg: 'cyan', bold: true });
                tester._body(tester._cells[cell_index-1], { bg: 'black', fg: 'white', bold: false });
                tester._body('out:', { bg: 'black', fg: 'cyan', bold: true });
                let outputs = tester._cell_outputs[cell_index-1];
                for (let output of outputs) {
                    if (output['output_type']==='stream') {
                        if (output['name']==='stdout') {
                            tester._body(output['text'], { bg: 'black', fg: 'white', bold: false });
                        } else if (output['name']==='stderr') {
                            tester._body(output['text'], { bg: 'black', fg: 'red', bold: false });
                        }
                    }
                }
                tester._body('error:', { bg: 'black', fg: 'cyan', bold: true });
                let errors = tester._cell_outputs_errors[cell_index-1];
                for (let error of errors) {
                    tester._body(error['ename'], { bg: 'black', fg: 'red', bold: true });
                    tester._body(error['evalue'], { bg: 'black', fg: 'red', bold: false });
                    tester._body(error['traceback'].join('\n'), { bg: 'black', fg: 'white', bold: false });
                }
            }

            tester._header('front-end console log' + (shown ? ' (continued)' : ''));
            tester._body('log:', { bg: 'black', fg: 'cyan', bold: true });
            if (that._logs[cell_index].length !== 0) {
                for (var i = 0; i < that._logs[cell_index].length; i++) {
                    tester._body(that._logs[cell_index][i], { bg: 'black', fg: 'white', bold: false });
                }
                that._logs[cell_index] = [];
            }
            tester._body('error:', { bg: 'black', fg: 'cyan', bold: true });
            if (that._logs_errors[cell_index].length !== 0) {
                for (var i = 0; i < that._logs_errors[cell_index].length; i++) {
                    tester._body(that._logs_errors[cell_index][i].text, { bg: 'black', fg: 'red', bold: true });
                    tester._body(that._logs_errors[cell_index][i].traceback, { bg: 'black', fg: 'white', bold: false });
                }
                that._logs_errors[cell_index] = [];
            }
            
            tester._header('');
        }
        tester.echo('\n');
    };

    // Handle per-cell failure.
    var that = this;
    var logall: boolean = Boolean(tester.cli.get('log-all'));

    this.test.on('fail', function(failure) {
        var timeElapsed = <any>(new Date()) - this.currentTestStartTime;
        this.currentSuite.addFailure(failure, timeElapsed - this.lastAssertTime);
        
        tester.echo('');
        tester.echo('Details:');
        output_cell(that._logs.length-1);
    });

    // Reset logs when notebook test is complete.
    this.test.on('test.done', function(result) {
        // test.done runs per-file,
        // but suiteResults is per-suite (directory)
        var current_errors;
        if (this.suiteResults) {
            // casper 1.1 has suiteResults
            current_errors = this.suiteResults.countErrors() + this.suiteResults.countFailed();
        } else {
            // casper 1.0 has testResults instead
            current_errors = this.testResults.failed;
        }

        if (current_errors > seen_errors) {
            if (logall) {

                // Output cell information.
                for (var i = 0; i < that._logs.length; i++) {
                    output_cell(that._logs.length-1);
                }
            }
        }

        seen_errors = current_errors;
        reset();
    });
};

tester._header = function(section: string, border_style: any={ bg: 'yellow', fg: 'black', bold: false }): void {
    for (let line of section.split('\n')) {
        while (line.length < 80) {
            line += ' ';
        }
        console.log(tester.colorizer.format(line, border_style));
    }
};

tester._body = function(section: string, body_style: any={ bg: 'black', fg: 'black', bold: false }, border_style: any={ bg: 'yellow', fg: 'black', bold: true }): void {
    for (let line of section.split('\n')) {
        // Wrap line if necessary, note- this niave method requires ansi color
        // codes to be stripped!
        line = line.replace(/\x1b[^m]*m/g, '');
        var continuation: boolean = false;
        while (line.length > 0) {
            let subline: string = line.substr(0, 77);
            line = line.replace(subline, '');

            var padding: string = '';
            while (subline.length + padding.length < 77) {
                padding += ' ';
            }

            console.log(
                <string><any>tester.colorizer.format(continuation ? '>' : ' ', border_style) + 
                <string><any>tester.colorizer.format(' ' + subline, body_style) +
                <string><any>tester.colorizer.format(padding, body_style) + 
                <string><any>tester.colorizer.format(line.length>0 ? '>' : ' ', border_style));
            continuation = true;
        }
    }
};

tester.interact = function(): void {
    // Start an interactive Javascript console.
    var system = require('system');
    system.stdout.writeLine('JS interactive console.');
    system.stdout.writeLine('Type `exit` to quit.');

    function read_line() {
        system.stdout.writeLine('JS: ');
        var line = system.stdin.readLine();
        return line;
    }

    var input = read_line();
    while (input.trim() != 'exit') {
        var output = this.evaluate(function(code) {
            return String(eval(code));
        }, {code: input});
        system.stdout.writeLine('\nOut: ' + output);
        input = read_line();
    }
};

tester._open_new_notebook = function(): void {
    // Create and open a new notebook.
    var baseUrl = this._get_notebook_server();
    this.start(baseUrl);
    this.waitFor(this._page_loaded);
    this.waitForSelector('#kernel-python2 a, #kernel-python3 a');
    this.thenClick('#kernel-python2 a, #kernel-python3 a');
    
    this.waitForPopup('');

    this.withPopup('', function () {this.waitForSelector('.CodeMirror-code');});
    this.then(function () {
        this.open(this.popups[0].url);
    });
    this.waitFor(this._page_loaded);

    // Hook the log and error methods of the console, forcing them to
    // serialize their arguments before printing.  This allows the
    // Objects to cross into the phantom/slimer regime for display.
    this.thenEvaluate(function(){
        var serialize_arguments = function(f, context) {
            return function() {
                var pretty_arguments = [];
                for (var i = 0; i < arguments.length; i++) {
                    var value = arguments[i];
                    if (value instanceof Object) {
                        var name = value.name || 'Object';
                        // Print a JSON string representation of the object.
                        // If we don't do this, [Object object] gets printed
                        // by casper, which is useless.  The long regular
                        // expression reduces the verbosity of the JSON.
                        pretty_arguments.push(name + ' {' + JSON.stringify(value, null, '  ')
                            .replace(/(\s+)?({)?(\s+)?(}(\s+)?,?)?(\s+)?(\s+)?\n/g, '\n')
                            .replace(/\n(\s+)?\n/g, '\n'));
                    } else {
                        pretty_arguments.push(value);
                    }
                }
                f.apply(context, pretty_arguments);
            };
        };
        console.log = serialize_arguments(console.log, console);
        console.error = serialize_arguments(console.error, console);
    });

    // Make sure the kernel has started
    this.waitFor(this._kernel_running);
    // track the IPython busy/idle state
    this.thenEvaluate(function () {
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
    this.waitFor(function() {
        return this.evaluate(function () {
            return IPython.notebook;
        });
    });
};

tester._get_notebook_server = function(): string {
    // Get the URL of a notebook server on which to run tests.
    var port = tester.cli.get("port");
    port = (typeof port === 'undefined') ? '8888' : port;
    return tester.cli.get("url") || ('http://127.0.0.1:' + port);
};

tester._page_loaded = function(): boolean {
    // Return whether or not the kernel is running.
    return this.evaluate(function() {
        return typeof IPython !== "undefined" &&
            IPython.page !== undefined;
    });
};

tester._kernel_running = function(): boolean {
    // Return whether or not the kernel is running.
    return this.evaluate(function() {
        return IPython &&
        IPython.notebook &&
        IPython.notebook.kernel &&
        IPython.notebook.kernel.is_connected();
    });
};

tester._init_events();
