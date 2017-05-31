# Using the Embed widget manager

## Description

This directory is an example project that shows how you can embed the widgets in
a context other than the notebook by embedding inline widget state in the html
document.

It makes use of the Embed widget manager provided with `jupyter-js-widgets`

If you plan to reproduce this in your own project, all you should need is the
html file (and none of the JavaScript), and to replace the script tag

`<script src="built/index.built.js"></script>`

with

`<script src="https://unpkg.com/jupyter-js-widgets/dist/embed.js"></script>`

We use of the locally built file in this example is meant to ensure that this
reflects the current state of the source repository and not the latest release.

If you need to specify a SEMVER range for the version of the embed manager, you
can do so by suffixing the package name with `@SEMVER_RANGE` in the URL. For
example

`<script src="https://unpkg.com/jupyter-js-widgets@^2.0.0/dist/embed.js"></script>`

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
