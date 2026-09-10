// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { test } from '@jupyterlab/galata';

import { expect } from '@playwright/test';

import * as path from 'path';

test.describe('Widget Visual Regression', () => {
  test.beforeEach(async ({ page, tmpPath }) => {
    await page.contents.uploadDirectory(
      path.resolve(__dirname, './notebooks'),
      tmpPath
    );
    await page.filebrowser.openDirectory(tmpPath);
  });

  test('Run notebook widgets.ipynb and capture cell outputs', async ({
    page,
    tmpPath,
  }) => {
    const notebook = 'widgets.ipynb';
    await page.notebook.openByPath(`${tmpPath}/${notebook}`);
    await page.notebook.activate(notebook);

    const captures = new Array<Buffer>();
    const cellCount = await page.notebook.getCellCount();

    await page.notebook.runCellByCell({
      onAfterCellRun: async (cellIndex: number) => {
        const cell = await page.notebook.getCellOutput(cellIndex);
        if (cell) {
          captures.push(await cell.screenshot());
        }
      },
    });

    await page.notebook.save();

    for (let i = 0; i < cellCount; i++) {
      const image = `widgets-cell-${i}.png`;
      expect.soft(captures[i]).toMatchSnapshot(image);
    }
  });

  test('captures Output widget output from background threads', async ({
    page,
    tmpPath,
  }) => {
    const notebook = 'output-background-thread.ipynb';
    await page.notebook.openByPath(`${tmpPath}/${notebook}`);
    await page.notebook.activate(notebook);

    const widgetOutput = page.locator('.jupyter-widget-output');
    await page.notebook.runCellByCell({
      onAfterCellRun: async (cellIndex: number) => {
        if (cellIndex === 1) {
          await expect(widgetOutput).toContainText('0');
        }
      },
    });

    await expect(widgetOutput).toHaveText('0 1 2 3 4 5 6 7 8 9', {
      timeout: 10_000,
    });

    expect(await page.notebook.getCellTextOutput(2)).toEqual([
      "'first foreground cell'",
    ]);
    expect(await page.notebook.getCellTextOutput(3)).toEqual([
      "'second foreground cell'",
    ]);
  });
});
