// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/// <reference path="notebook_test.d.ts" />
import notebook = require('./notebook');
import printer = require('./printer');

export interface WidgetCasper extends Casper {
    notebook: notebook.Notebook;
    printer: printer.Printer;
    _page_error_flag: boolean;
    _reset_page_error(): void;
    _init_events(): void;
    _logs: string[][];
    _logs_errors: any[][];

    start_notebook_then(): WidgetCasper;
    stop_notebook_then(): WidgetCasper;
    cell(text: string, callback?: (index?: number) => void, expect_error?: boolean, cell_type?: string, execute?: boolean): WidgetCasper;
    wait_for_busy(): WidgetCasper;
    wait_for_idle(): WidgetCasper;
    wait_for_output(cell_num: number, out_num: number): WidgetCasper;
    wait_for_widget(model_id: string): WidgetCasper; // move to notebook?
    wait_for_element(index: number, selector: string): WidgetCasper;
    assert_output_equals(content: string, output_text: string, message: string): WidgetCasper;
    interact(): WidgetCasper;
    _reset(): void;


    // Casper builtin methods.
    // Override return value of Casper to WidgetCasper.
    colorizer: Colorizer;
    cli: { get: (name: string) => any; has: (name: string) => boolean; };
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
