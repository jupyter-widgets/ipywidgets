/// <reference path="typings/notebook_test.d.ts" />

export interface WidgetCasper extends NotebookCasper {
    cell(text: string, callback?: (index?: number) => void): WidgetCasper;

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
    evaluateOrDie(fn: () => any, message?: string, status?: number): WidgetCasper;
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


/**
 * Appends and exectues a cell.
 * @param contents
 * @param callback - function to callback when the cell has been executed.
 */
tester.cell = function(contents: string, callback?: (index?: number) => void): WidgetCasper {
    let lines: string[] = contents.split('\n');
    let indent: number = null;
    for (let line of lines) {
        let local_indent = contents.length - contents.replace(/^\s+/, '').length;
        if (indent === null || indent > local_indent) {
            indent = local_indent;
        }
    }

    let new_lines: string[] = [];
    for (let line of lines) {
        new_lines.push(line.substr(indent-1));
    }
    contents = new_lines.join('\n');
    tester.then(() => {
        let index: number = this.append_cell(contents);
        tester.execute_cell_then(index, callback);    
    });
    return tester;
};
