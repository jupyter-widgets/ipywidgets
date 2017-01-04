# Ad hoc widget manager for using `jupyter-js-widgets` in non-notebook, web context

## Description

This directory is an example project that shows how to use the
`jupyter-js-widgets` library in a pure JavaScript context.

This example implements a custom specialization of the base widget manager
provided by the `jupyter-js-widgets` library (just like the notebook extension
provides a specialization for the notebook context).

This example is meant to demonstrate how to create an ad-hoc widget manager.
For more sophisticated examples including communication with a Python kernel,
check out the other web examples.

## Try it

1. Start with a development install of `jupyter-js-widgets` by running
   `npm install` in the `jupyter-js-widgets` subfolder of the repo root
   (see the [README.md](../../../README.md) in the repo root for more details).
2. Cd into this directory and run `npm install`.
3. Now open the `index.html` file.

## Details

If you plan to reproduce this in your own project, pay careful attention to the
`package.json` file.  The dependency to `jupyter-js-widgets`, which reads
`"jupyter-js-widgets": "file:../../../ipywidgets"`, **should not** point to
`"file:../../../ipywidgets"`.

Instead point it to the version you want to use on npm.

(but really, you should let npm do this for you by running

`npm install --save jupyter-js-widgets`.)
