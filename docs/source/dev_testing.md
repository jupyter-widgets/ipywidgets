# Unit Tests

To run the Python tests:

```sh
pytest --cov=ipywidgets ./python/ipywidgets
```

To run the Javascript tests in each package directory:

```sh
yarn test
```

This will run the test suite using `karma` with 'debug' level logging.

# Visual Regression Tests

`ipywidgets` uses the [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) framework for visual regression testing. Galata provides a high level API to programmatically interact with the JupyterLab UI, and tools for taking screenshots and generating test reports.

UI tests are written in TypeScript and run with the Playwright test runner. The test suites are located in the [ui-tests/tests](https://github.com/jupyter-widgets/ipywidgets/tree/main/ui-tests/tests) directory.

The [main test suite](https://github.com/jupyter-widgets/ipywidgets/tree/main/ui-tests/tests/widgets.test.ts) uploads a [notebook](https://github.com/jupyter-widgets/ipywidgets/tree/main/ui-tests/tests/notebooks/widgets.ipynb) to JupyterLab, runs it cell by cell and captures a screenshot of the cell outputs. The cell outputs correspond to widgets of different types. The cell outputs captures are then compared to the [reference snapshots](https://github.com/jupyter-widgets/ipywidgets/tree/main/ui-tests/tests/widgets.test.ts-snapshots/) to detect any visual regression. The test report (diffs, result, videos) is uploaded to GitHub as an artifact and accessible from the GitHub Actions page in `Artifacts` section.

## Running Tests Locally

First install the dependencies:

```sh
cd ui-tests
yarn install
```

Galata needs to connect to a running instance of JupyterLab 3 to run UI tests. First launch JupyterLab and keep it running in a terminal window.

```sh
# in ui-tests directory
yarn start
```

Then run the `test` script:

```sh
# in the ui-tests directory
yarn test
```

You can pass additional arguments to `playwright` by appending parameters to the command. For example to run the test in headed mode, `yarn test --headed`.

Checkout the [Playwright Command Line Reference](https://playwright.dev/docs/test-cli/) for more information about the available command line options.

## Adding new UI tests

New test suites can be added to the [ui-tests/tests](https://github.com/jupyter-widgets/ipywidgets/tree/main/ui-tests/tests) directory. Their names need to end with `.test.ts`. You can see some additional example test suites in the [JupyterLab repo](https://github.com/jupyterlab/jupyterlab/blob/master/galata/test). If the tests in new suites are doing visual regression tests or HTML source regression tests then you also need to add their reference images to the `-snapshots` directories.

## Reference Image Captures

When doing visual regression tests, it is important to use reference images that were generated in the same environment. Otherwise, even though the same browser is used for testing, there might be minor differences that could cause visual regression tests to fail.

When adding a new visual regression test, first make sure your tests pass locally on your development environment, with a reference snapshots generated in your dev environment. You can generate new reference snapshots by running `yarn test:update`.

To update the snapshots:

- push the new changes to the branch
- wait for the CI check to complete
- go to the artifacts section and download the `ipywidgets-updated-snapshots` archive
- extract the archive
- copy the `-snapshots` directories to replace the existing ones
- commmit and push the changes
