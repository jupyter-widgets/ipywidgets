// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import iwidgetcasper = require('./iwidgetcasper');
import notebook = require('./notebook');
import printer = require('./printer');

// Alias casperjs, the widget tests
export var tester: iwidgetcasper.WidgetCasper = <iwidgetcasper.WidgetCasper><any>casper;

tester.options.waitTimeout=10000;

/**
 * Start a notebook for testing.
 */
tester.start_notebook_then = function(): iwidgetcasper.WidgetCasper {
    this.notebook = new notebook.Notebook(this);
    this.printer = new printer.Printer(this, this.notebook);
    this._reset();

    // CONSOLE.ERROR AND LOG HOOKS
    // ---------------------------
    // Hook the log and error methods of the console, forcing them to
    // serialize their arguments before printing.  This allows the
    // Objects to cross into the phantom/slimer regime for display.
    // 
    // Also, intercept and store the console.error messages.  Phantom
    // cannot discern between console.error and console.log, so we
    // have to do it ourselves.  Later, when the cell completes, check
    // the stored console.error messages and fail if any exist.
    this.thenEvaluate(function(){
        var serialize_arguments = function(f, context, iserror?) {
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
                        var stringify = (obj) => name + ' {' + JSON.stringify(obj, null, '  ')
                                .replace(/(\s+)?({)?(\s+)?(}(\s+)?,?)?(\s+)?(\s+)?\n/g, '\n')
                                .replace(/\n(\s+)?\n/g, '\n');
                        try {
                            pretty_arguments.push(stringify(value));

                        } catch(e) {
                            try {
                                // Fallback to logging a depth of 3
                                var copy_fixed_depth = function(obj: any, max_depth: number, depth: number=0) {
                                    var clone: any = {};
                                    for (var key of Object.keys(obj)) {
                                        switch (typeof obj[key]) {
                                            case 'boolean':
                                            case 'string':
                                            case 'number':
                                                clone[key] = obj[key];
                                                break;
                                            case 'object':
                                                if (depth < max_depth) {
                                                    clone[key] = copy_fixed_depth(obj[key], max_depth, depth+1);
                                                }
                                                break;
                                        }
                                    }
                                    return clone;
                                };

                                pretty_arguments.push(stringify(copy_fixed_depth(value, 2)));
                            } catch(f) {
                                // Couldn't JSONify, push String repr instead.
                                pretty_arguments.push(String(value) + ' (not JSONable)');
                            }
                        }

                    } else {
                        pretty_arguments.push(value);
                    }
                }
                
                // Phantom loses the knowledge about whether or not this was 
                // a console.error when passing into the test context, so we
                // will keep track of that ourselves.
                
                if (iserror) {
                    if (window._logged_error === undefined) window._logged_error = [];
                    window._logged_error.push(pretty_arguments);
                } else {
                    f.apply(context, pretty_arguments);    
                }
            };
        };
        console.log = serialize_arguments(console.log, console);
        console.error = serialize_arguments(console.error, console, true);
    });

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

/**
 * Close the started notebook and conclude the tests.
 */
tester.stop_notebook_then = function(): iwidgetcasper.WidgetCasper {
    this.then(() => {
        this._reset_page_error();
    });

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
 * @param contents - contents to put in the cell
 * @param callback - function to call after the cell has been appended (and executed).
 * @param expect_error - whether or not an error should be expected when the cell executes.
 * @param cell_type - type of the cell, defaults to 'code'
 * @param execute - execute the cell after appending it
 */
tester.cell = function(contents: string, callback?: (index?: number) => void, expect_error: boolean=false, cell_type: string='code', execute: boolean=true): iwidgetcasper.WidgetCasper {
    this.then(() => {
        this._reset_page_error();
    });
    
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
        let index: number = this.notebook.append_cell(contents, cell_type);
        this._logs.push([]);
        this._logs_errors.push([]);

        // Synchronously execute a cell by index.
        if (execute) {
            this.notebook.execute_cell(index, expect_error);
        }

        // Call the callback if it's defined.
        if (callback!==undefined) {
            this.then(() => { 
                callback.apply(this, [index]);
            });
        }
    });

    return this;
};

/**
 * Wait for the notebook to be busy
 */
tester.wait_for_busy = function (): iwidgetcasper.WidgetCasper {
    this.waitFor(() => this.notebook.is_busy());
    return this;
};

/**
 * Wait for the notebook to be idle
 */
tester.wait_for_idle = function (): iwidgetcasper.WidgetCasper {
    this.waitFor(() => this.notebook.is_idle());
    return this;
};

/**
 * Wait for a cell to execute and recieve output
 */
tester.wait_for_output = function (cell_num: number, out_num: number): iwidgetcasper.WidgetCasper {
    this.wait_for_idle();
    this.waitFor(() => this.notebook.has_output(cell_num, out_num));
    return this;
};

/**
 * Wait for a widget msg que to reach 0
 * @param model_id - Model id of the widget.
 */
tester.wait_for_widget = function(model_id: string): iwidgetcasper.WidgetCasper {
    // Clear the results of a previous query, if they exist.  Make sure a
    // dictionary exists to store the async results in.
    this.thenEvaluate(function(model_id) {
        if (window.pending_msgs === undefined) { 
            window.pending_msgs = {}; 
        } else {
            window.pending_msgs[model_id] = -1;
        } 
    }, {model_id: model_id});

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
        }, {model_id: model_id});

        if (pending === 0) {
            return true;
        } else {
            return false;
        }
    });
    return this;
};

/**
 * Assert if output isn't equal to what's expected.
 * @param code
 * @param output_text - expected output
 * @param message - message to associate to the assertion
 */
tester.assert_output_equals = function(code: string, output_text: string, message: string): iwidgetcasper.WidgetCasper {
    // Append a code cell with the code, then assert the output is equal to output_text
    this.cell(code, (index) => {
        this.test.assertEquals(this.notebook.get_output(index).text.trim(), output_text, message);
    });
    return this;
};

/**
 * Wait for an element to exist in a cell.
 */
tester.wait_for_element = function(index: number, selector: string): iwidgetcasper.WidgetCasper {
    // Utility function that allows us to easily wait for an element 
    // within a cell.  Uses JQuery selector to look for the element.
    this.waitFor(() => this.notebook.cell_element_exists(index, selector));
    return this;
};

/**
 * Resets the page error flag.  Fails a test if it's true.
 */
tester._reset_page_error = function(): void {
    // See if console.error was called in the front-end.
    var logged_errors: boolean = this.evaluate(function() {
        return window._logged_error !== undefined && window._logged_error.length > 0;
    });
    
    // Copy logged errors into page error cache.
    if (logged_errors) {
        var errors: any[][] = this.evaluate(function() {
            var errors = window._logged_error;
            window._logged_error = [];
            return errors;
        });

        for (var error_list of errors) {
            for (var error of error_list) {
                tester._logs_errors[tester.notebook.cell_index].push({
                    text: 'console.error',
                    traceback: error
                });
            }
        }
    }

    if (this._page_error_flag || logged_errors) {
        this._page_error_flag = false;
        this.test.fail('Front-end JS error');
    }

};

/**
 * Launch an interactive JS prompt
 */
tester.interact = function(): iwidgetcasper.WidgetCasper {
    this.then(() => {
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
    });

    return this;
};

/**
 * Reset the logging, for a new notebook.
 */
tester._reset = function(): void {
    this._logs = [[]];
    this._logs_errors = [[]];
    this._page_error_flag = false;

    this.printer.reset();
}

/**
 * Register event listeners.
 */
tester._init_events = function(): void {
    // show captured errors
    var seen_errors = 0;
    
    this.on('remote.message', (msg) => {
        this._logs[this.notebook.cell_index].push(msg);
    });

    this.on("resource.error", function onError(re: any) {
        // Ignore about:blank errors
        if (re.url === 'about:blank') return;

        this.echo("Front-end resource error (recorded)", "WARNING");
        tester._logs_errors[tester.notebook.cell_index].push({
            text: re.errorString,
            traceback: re.url
        });

        // Set the page error flag.
        tester._page_error_flag = true;
    });

    this.on("page.error", function onError(msg: string, trace) {
        // show errors in the browser
        this.echo('Front-end JS error (recorded)', 'WARNING');

        let error = {
            text: msg,
            traceback: ''
        }

        var local_path = this.notebook.get_notebook_server();
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

        tester._logs_errors[tester.notebook.cell_index].push(error);

        // Set the page error flag.
        tester._page_error_flag = true;
    });

    // Handle per-cell failure.
    var that = this;
    var logall: boolean = tester.cli.has('logall');
    var logsuccess: boolean = tester.cli.has('logsuccess');

    this.test.on('fail', function(failure) {
        var timeElapsed = <any>(new Date()) - this.currentTestStartTime;
        this.currentSuite.addFailure(failure, timeElapsed - this.lastAssertTime);
        
        tester.echo('');
        if (!(logall || logsuccess)) {
            tester.echo('Details:');
            that.printer.print_cell(that._logs.length-1, that._logs, that._logs_errors);
        } else {            
            tester.echo("For details, see cell " + String(that._logs.length-1) + " bellow.", 'WARN_BAR');
            tester.echo('');
        }
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

        if (logsuccess || (logall && current_errors > seen_errors)) {
            // Output cell information.
            for (var i = 0; i < that._logs.length; i++) {
                that.printer.print_cell(i, that._logs, that._logs_errors);
            }
        }

        seen_errors = current_errors;
        tester._reset();
    });
};

tester._init_events();
