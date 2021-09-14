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
    await page.dblclick(`text=${tmpPath}`);
  });

  test('Run notebook widgets.ipynb and capture cell outputs', async ({
    page,
  }) => {
    const notebook = 'widgets.ipynb';
    await page.notebook.open(notebook);
    expect(await page.notebook.isOpen(notebook)).toBeTruthy();
    await page.notebook.activate(notebook);
    expect(await page.notebook.isActive(notebook)).toBeTruthy();

    let numCellImages = 0;

    const getCaptureImageName = (id: number): string => {
      return `cell-${id}`;
    };

    await page.notebook.runCellByCell({
      onAfterCellRun: async (cellIndex: number) => {
        const cell = await page.notebook.getCellOutput(cellIndex);
        if (cell) {
          expect(cell.screenshot()).toMatchSnapshot(
            getCaptureImageName(numCellImages)
          );
          {
            numCellImages++;
          }
        }
      },
    });
  });
});
