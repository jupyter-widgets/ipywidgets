// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import iwidgetcasper = require('./iwidgetcasper');
import notebook = require('./notebook');

/**
 * Class that pretty prints cell information
 */
export class Printer {
    private _tester: iwidgetcasper.WidgetCasper;
    private _notebook: notebook.Notebook;
    private _printed_cells: number[];

    public constructor(tester: iwidgetcasper.WidgetCasper, notebook: notebook.Notebook) {
        this._tester = tester;
        this._notebook = notebook;
        this.reset();
    }

    /**
     * Resets the printer for a new notebook.
     * Why?  The printer remembers what cells it has already
     * printed so that it never re-prints the same information.
     */
    public reset(): void {
        this._printed_cells = [];
    }

    /**
     * Pretty print a cell.
     * @param cell_index
     * @param logs - console.log logs, stored internally in WidgetCasper
     * @param logs_errors - console.error and JS error logs, stored internally in WidgetCasper
     */
    public print_cell(cell_index: number, logs: string[][], logs_errors: any[][]): void {
        var shown: boolean = (this._printed_cells.indexOf(cell_index) !== -1);
        if (!shown) this._printed_cells.push(cell_index);
        if (cell_index===0) {
            this._header('Before cell(s)' + (shown ? ', see details above.' : ':'), { bg: 'yellow', fg: 'black', bold: true });
        } else {
            this._header('While in cell ' + String(cell_index) + (shown ? ', see details above.' : ':'), { bg: 'yellow', fg: 'black', bold: true });
        }
        if (!shown || logs[cell_index].length !== 0 || logs_errors[cell_index].length !== 0) {


            if (cell_index!==0 && !shown) {
                this._header('kernel');
                this._body('in:', { bg: 'black', fg: 'cyan', bold: true });
                this._body(this._notebook.get_cell(cell_index-1), { bg: 'black', fg: 'white', bold: false });
                this._body('out:', { bg: 'black', fg: 'cyan', bold: true });
                let outputs = this._notebook.get_cached_outputs(cell_index-1);
                for (let output of outputs) {
                    if (output['output_type']==='stream') {
                        if (output['name']==='stdout') {
                            this._body(output['text'], { bg: 'black', fg: 'white', bold: false });
                        } else if (output['name']==='stderr') {
                            this._body(output['text'], { bg: 'black', fg: 'red', bold: false });
                        }
                    }
                }
                this._body('error:', { bg: 'black', fg: 'cyan', bold: true });
                let errors = this._notebook.get_cached_output_errors(cell_index-1);
                for (let error of errors) {
                    this._body(error['ename'], { bg: 'black', fg: 'red', bold: true });
                    this._body(error['evalue'], { bg: 'black', fg: 'red', bold: false });
                    this._body(error['traceback'].join('\n'), { bg: 'black', fg: 'white', bold: false });
                }
            }

            this._header('front-end console log' + (shown ? ' (continued)' : ''));
            this._body('log:', { bg: 'black', fg: 'cyan', bold: true });
            if (logs[cell_index].length !== 0) {
                for (var i = 0; i < logs[cell_index].length; i++) {
                    this._body(logs[cell_index][i], { bg: 'black', fg: 'white', bold: false });
                }
                logs[cell_index] = [];
            }
            this._body('error:', { bg: 'black', fg: 'cyan', bold: true });
            if (logs_errors[cell_index].length !== 0) {
                for (var i = 0; i < logs_errors[cell_index].length; i++) {
                    this._body(logs_errors[cell_index][i].text, { bg: 'black', fg: 'red', bold: true });
                    this._body(logs_errors[cell_index][i].traceback, { bg: 'black', fg: 'white', bold: false });
                }
                logs_errors[cell_index] = [];
            }
            
            this._header('');
        }
        this._tester.echo('\n');
    }

    /**
     * Pretty print a header.
     */
    private _header(section: string, border_style: any={ bg: 'yellow', fg: 'black', bold: false }): void {
        for (let line of section.split('\n')) {
            while (line.length < 80) {
                line += ' ';
            }
            console.log(this._tester.colorizer.format(line, border_style));
        }
    }

    /**
     * Pretty print body content.
     */
    private _body(section: string, body_style: any={ bg: 'black', fg: 'black', bold: false }, border_style: any={ bg: 'yellow', fg: 'black', bold: true }): void {
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
                    <string><any>this._tester.colorizer.format(continuation ? '>' : ' ', border_style) + 
                    <string><any>this._tester.colorizer.format(' ' + subline, body_style) +
                    <string><any>this._tester.colorizer.format(padding, body_style) + 
                    <string><any>this._tester.colorizer.format(line.length>0 ? '>' : ' ', border_style));
                continuation = true;
            }
        }
    }
}