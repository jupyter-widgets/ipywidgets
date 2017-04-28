# Ad hoc widget manager reading a file with the `application/vnd.jupyter.widget-state+json` mime type.

## Description

This directory is an example project that shows how you can embed the widgets in
a context other than the notebook.

This example implements a custom specialization of the base widget manager
provided by the `jupyter-js-widgets` library (just like the notebook extension
provides a specialization for the notebook context).

This custom widget manager reads the state of the widget manager in the
`widget_state.json` file, which respects the standardized JSON schema for the
`application/vnd.jupyter.widget-state+json` mime type.

Such a `widget_state.json` file can be generated from rendered widgets in the
notebook UI with the *Download widget state* action.

Besides, this example also displays read-only text area containing the code
provided in the `widget_code.json`, which we used to generate the widget state.

This example does not implement the communication with a Python backend. For
such an example, check out the `web3` example.

## Try it

1. Start with a development install of jupyter-js-widgets by running
   `npm install` in the `jupyter-js-widgets` subfolder of the repo root
   (see the [README.md](../../../README.md) in the repo root for more details).
2. Cd into this directory and run `npm install`.
3. Now open the `index.html` file.

## Details

If you plan to reproduce this in your own project, pay careful attention to the
dependency to `jupyter-js-widgets`, which in this example is a relative path.
Instead point it to the version you want to use on npm by installing it using
something like `npm install --save jupyter-js-widgets`.
