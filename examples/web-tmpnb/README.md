# Using jupyter-js-widgets in non-notebook, web context + tmpnb backend

## Description

This directory is an example project that shows how to use `jupyter-js-widgets`
and `ipywidgets` in a web context other than the notebook. This example makes
use of the `tmpnb` service to spawn a new transient Jupyter notebook server from
which it then requests a Python kernel.

This example also displays a read-only text area containing the code
provided in the `widget_code.json`, which we used to generate the widget state.

## Try it

1. Start with a repository checkout, and run `npm install` in the root directory.
2. Run `npm run build:examples` in the root directory.
3. Change to this directory
4. Run `npm run host`
5. In a new terminal run `python -m notebook --no-browser --NotebookApp.allow_origin="*"`
6. In a web browser, navigate to `http://localhost:8080/` (or the address specified by the `npm run host` command)
