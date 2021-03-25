// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { galata, describe, test } from '@jupyterlab/galata';
import * as path from 'path';

jest.setTimeout(100000);

describe('Widget Visual Regression', () => {
  beforeAll(async () => {
    await galata.resetUI();
    galata.context.capturePrefix = 'widgets';
  });

  afterAll(async () => {
    galata.context.capturePrefix = '';
  });

  test('Upload files to JupyterLab', async () => {
    await galata.contents.moveDirectoryToServer(
      path.resolve(__dirname, `./notebooks`),
      'uploaded'
    );
    expect(
      await galata.contents.fileExists('uploaded/widgets.ipynb')
    ).toBeTruthy();
    expect(
      await galata.contents.fileExists('uploaded/WidgetArch.png')
    ).toBeTruthy();
  });

  test('Refresh File Browser', async () => {
    await galata.filebrowser.refresh();
  });

  test('Open directory uploaded', async () => {
    await galata.filebrowser.openDirectory('uploaded');
    expect(
      await galata.filebrowser.isFileListedInBrowser('widgets.ipynb')
    ).toBeTruthy();
  });

  test('Run notebook widgets.ipynb and capture cell outputs', async () => {
    const notebook = 'widgets.ipynb';
    await galata.notebook.open(notebook);
    expect(await galata.notebook.isOpen(notebook)).toBeTruthy();
    await galata.notebook.activate(notebook);
    expect(await galata.notebook.isActive(notebook)).toBeTruthy();

    let numCellImages = 0;

    const getCaptureImageName = (id: number): string => {
      return `cell-${id}`;
    };

    await galata.notebook.runCellByCell({
      onAfterCellRun: async (cellIndex: number) => {
        const cell = await galata.notebook.getCellOutput(cellIndex);
        if (cell) {
          if (
            await galata.capture.screenshot(
              getCaptureImageName(numCellImages),
              cell
            )
          ) {
            numCellImages++;
          }
        }
      }
    });

    for (let c = 0; c < numCellImages; ++c) {
      expect(
        await galata.capture.compareScreenshot(getCaptureImageName(c))
      ).toBe('same');
    }
  });

  test('Close notebook widgets.ipynb', async () => {
    await galata.notebook.close(true);
  });

  test('Open home directory', async () => {
    await galata.filebrowser.openHomeDirectory();
  });

  test('Delete uploaded directory', async () => {
    await galata.contents.deleteDirectory('uploaded');
  });
});
