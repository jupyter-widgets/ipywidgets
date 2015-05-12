/// <reference path="tsd.d.ts" />

declare var IPython: any;
declare var define: any;
declare var casper: NotebookCasper;

interface NotebookCasper extends Casper {
    notebook_test(test: () => void): void;
    execute_cell_then(index: number, callback: (...args: any[]) => any): void;
}
