# Using the Embed widget manager

## Description

This directory is an example project that shows how you can embed the widgets in
a context other than the notebook by embedding inline widget state in the html
document.

If you plan to reproduce this in your own project, all you should need is the
html file (and none of the JavaScript), and to replace the script tag

`<script src="built/index.built.js"></script>`

with

`<script src="https://unpkg.com/@jupyter-widgets/html-manager/dist/index.js"></script>`

We use of the locally built file in this example is meant to ensure that this
reflects the current state of the source repository and not the latest release.

If you need to specify a semver range for the version of the embed manager, you
can do so by suffixing the package name with `@SEMVER_RANGE` in the URL. For
example

`<script src="https://unpkg.com/@jupyter-widgets/html-manager@^2.0.0/dist/index.js"></script>`

## Try it

1. Start with a repository checkout, and run `npm install` in the root directory.
2. Run `npm run build:examples` in the root directory.
3. Open the `index.html` file in this directory.
