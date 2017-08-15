# Using the HTML widget manager

## Description

This is an example project showing how to embed widgets in an HTML document.

We use the local `index.built.js` that we build to make sure this example
reflects the current state of the source repository. To use the latest release
of the HTML wiget manager in your own project, copy the `index.html` file and
replace

`<script src="./built/index.built.js"></script>`

with

`<script src="https://unpkg.com/@jupyter-widgets/html-manager/dist/embed.js" crossorigin="anonymous"></script>`

If you need a specific version of the HTML widget manager, you can include a
semver range. For example:

`<script src="https://unpkg.com/@jupyter-widgets/html-manager@^0.8.0/dist/embed.js" crossorigin="anonymous"></script>`

## Try it

1. Start with a repository checkout, and run `npm install` in the root directory.
2. Run `npm run build:examples` in the root directory.
3. Open the `index.html` file in this directory.
