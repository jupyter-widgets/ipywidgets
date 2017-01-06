# Embedding Jupyter Widgets in Other Contexts than the Notebook

Jupyter interactive widgets can be serialized and embedded into

 - static web pages
 - sphinx documentation
 - html-converted notebooks on nbviewer

## Embedding Widgets in HTML Web Pages

The notebook interface provides a context menu for generating an HTML snippet
that can be embedded into any static web page:

![embedding](./embed.gif)

The context menu provides three actions

 - Save Notebook with Widgets
 - Download Widget State
 - Embed Widgets

### Embeddable HTML Snippet

The last option, `Embed widgets`, provides a dialog containing an HTML snippet
which can be used to embed Jupyter interactive widgets into any web page.

This HTML snippet is composed of multiple `<script>` tags:

 - The first script tag loads a custom widget manager from the `unpkg` cdn.
 - The second script tag contains the state of all the widget models currently
   in use. It has the mime type `application/vnd.jupyter.widget-state+json`.

   The JSON schema for the content of that script tag is:

    ```json
    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "description": "Jupyter Interactive Widget State JSON schema.",
        "type": "object",
        "properties" : {
            "version_major" : {
                "description": "Format version (major)",
                "type": "number",
                "minimum": 1,
                "maximum": 1
            },
            "version_minor" : {
                "description": "Format version (minor)",
                "type": "number"
            },
            "state": {
                "description": "Model State for All Widget Models",
                "type": "object",
                "additionalProperties": true,
                "additionalProperties" : {
                    "type": "object",
                    "properties": {
                        "model_name": {
                            "description" : "Name of the JavaScript class holding the model implementation",
                            "type": "string"
                        },
                        "model_module": {
                            "description" : "Name of the JavaScript module holding the model implementation",
                            "type": "string"
                        },
                        "model_module_version": {
                            "description" : "Semver range for the JavaScript module holding the model implementation",
                            "type": "string"
                        },
                        "state": {
                            "description" : "Serialized state of the model",
                            "type": "object",
                            "additional_properties": true
                        }
                    },
                    "required": [ "model_name", "model_module", "state" ],
                    "additionalProperties": false
                }
            }
        },
        "required": [ "version_major", "version_minor", "state" ],
        "additionalProperties": false
    }
    ```

- The following script tags correspond to the views which you want to display
  in the web page. They have the mime type `application/vnd.jupyter.widget-view+json`.

  The *Embed Widgets* action currently creates such a tag for each view
  displayed in the notebook at this time.

  The JSON schema for the content of that script tag is:

    ```json
    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "description": "Jupyter Interactive Widget View JSON schema.",
        "type": "object",
        "properties" : {
            "version_major" : {
                "description": "Format version (major)",
                "type": "number",
                "minimum": 1,
                "maximum": 1
            },
            "version_minor" : {
                "description": "Format version (minor)",
                "type": "number"
            },
            "model_id": {
                "description": "Unique identifier of the widget model to be displayed",
                "type": "string"
            },
            "required": [ "model_id" ]
        },
        "additionalProperties": false
    }
    ```

  If you want to lay out these script tags in a custom fashion or only keep
  some of them, you can change their location in the DOM when including the
  snippet into a web page.

### Widget State JSON

The second option, `Download Widget State`, triggers the downloading of a JSON
file containing the serialized state of all the widget models currently in use,
corresponding to the same JSON schema.

## Embedding Widgets in the Sphinx HTML Documentation

As of ipywidgets 6.0, Jupyter interactive widgets can be rendered and
interacted with in sphinx html documentation. Two means of achieving this are
provided

### Using the Jupyter Sphinx Extension

The [jupyter_sphinx](https://github.com/jupyter/jupyter-sphinx) extension
enables jupyter-specific features in sphinx. It can be install with `pip` and
`conda`.

In the `conf.py` sphinx configuration file, add `jupyter_sphinx.embed_widgets`
to list of enabled extensions.

Two directives are provided: `ipywidgets-setup` and `ipywidgets-display`.

`ipywidgets-setup` code is used run potential boilerplate and configuration
code prior to running the display code. For example:

```rst
.. ipywidgets-setup::

    from ipywidgets import VBox, jsdlink, IntSlider, Button

.. ipywidgets-display::

    s1, s2 = IntSlider(max=200, value=100), IntSlider(value=40)
    b = Button(icon='legal')
    jsdlink((s1, 'value'), (s2, 'max'))
    VBox([s1, s2, b])
```

In the case of the `ipywidgets-display` code, the *last statement* of the
code-block should contain the widget object you wish to be rendered.

### Using the `nbsphinx` Project

The [nbsphinx](https://github.com/spatialaudio/nbsphinx) sphinx extension
provides a source parser for `*.ipynb` files. Custom Sphinx directives are used
to show Jupyter Notebook code cells (and of course their results) in both HTML
and LaTeX output.

In the case of the HTML output, Jupyter Interactive Widgets are also supported.
However, it is a requirement that the notebook was correctly saved with the
special "Save Notebook with Widgets" action in the widgets menu.

## Rendering Interactive Widgets on [nbviewer](http://nbviewer.jupyter.org/)

If your notebook was saved with the special "Save Notebook with Widgets" action
in the Widgets menu, interative widgets displayed in your notebook should also
be rendered on nbviewer.

See e.g. the [Widget List](http://nbviewer.jupyter.org/github/ipython/ipywidgets/blob/master/docs/source/examples/Widget%20List.ipynb)
example from the documentation.

## The Case of Custom Widget Libraries

Custom widgets can also be rendered on nbviewer, static HTML and RTD
documentation. An illustration of this is the http://jupyter.org/widgets
gallery.

The widget embedder attempts to fetch the model and view implementation of the
custom widget from the npmjs CDN, https://unpkg.com. The URL that is requested
for e.g. the `bqplot` module name with the semver range `^2.0.0` is

`https://unpkg.com/bqplot@^2.0.0/dist/index.js`

which holds the webpack bundle for the bqplot library.

The [widget-cookiecutter](https://github.com/jupyter/widget-cookiecutter)
template project contains a template project for a custom widget library
following the best practices for authoring widgets, which ensure that your
custom widget library can render on nbviewer.

## Using `jupyter-js-widgets` in web contexts

The core `jupyter-js-widgets` library, the JavaScript package of ipywidgets is
agnostic to the context in which it is used (Notebook, JupyterLab, static web
page). For each context, we specialize the base widget manager implemented in
`jupyter-js-widgets` to provide the logic for

 - where widgets should be displayed,
 - how to retrieve information about their state.

Specifically:

 - `widgetsnbextension` provides the implementation of a specialized widget
   manager for the `Classic Notebook`, and the packaging logic as a notebook
   extension.
 - `jupyterlab_widgets` provides the implementation of a specialized widget
   manager for the context of `JupyterLab`, and the packaging logic as a lab
   extension.
 - The embed manager implemented in `jupyter-js-widgets` is a specialization of
   the base  widget manager used for the static embedding of widgets used by
   the `Sphinx` extension, `nbviewer`, and the "Embed Widgets" command
   discussed above.

We provide additional examples of specializations of the base widget manager
implementing other usages of `jupyter-js-widgets` in web contexts.

1. The `web1` example is a simplistic example showcasing the use of
   `jupyter-js-widgets` in a web context.
2. The `web2` example is a simple example making use of the
   `application/vnd.jupyter.widget-state+json` mime type.
3. The `web3` example showcases how communication with a Jupyter kernel can
   happen in a web context outside of the notebook or jupyterlab contexts.
4. The `web4` example is a tests for the embed widget manager.
5. The `web5` example makes use of the `tmpnb` service to spawn a Jupyter
   server, request a kernel from this server and implement the same feature as
   the `web3` example.

