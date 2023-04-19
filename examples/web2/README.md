# Ad hoc widget manager reading a file with the `application/vnd.jupyter.widget-state+json` mime type.

## Description

This directory is an example project that shows how to use the
Jupyter widgets library in a pure JavaScript context.

This example implements a simple widget manager
by extending the base widget manager from the `@jupyter-widgets/base` library. This custom widget manager reads the state of the widget manager in the
`widget_state.json` file, which respects the standardized JSON schema for the
`application/vnd.jupyter.widget-state+json` mime type. Such a `widget_state.json` file can be generated from rendered widgets in the
classic Jupyter Notebook with the _Download widget state_ action.

This example also displays a read-only text area containing the code
provided in the `widget_code.json`, which we used to generate the widget state.

This example does not implement the communication with a Python backend. For
such an example, check out the `web3` example.

## Try it

1. Start with a repository checkout, and run `yarn install` in the root directory.
2. Run `yarn build:examples` in the root directory.
3. Open the `index.html` file in this directory.
