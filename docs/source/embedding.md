# Embedding Jupyter Widgets in Other Contexts than the Notebook

Jupyter interactive widgets can be serialized and embedded into

 - static web pages
 - sphinx documentation
 - html-converted notebooks on nbviewer

Here, we discuss embedding widgets using the custom widget manager in the `@jupyter-widgets/html-manager` npm package. Two embedders are provided:

1. A basic embedder that only embeds standard controls, but can be used on any web page
2. An embedder that uses RequireJS, and can embed standard and custom widgets


## Embedding Widgets in HTML Web Pages

The classic notebook interface provides a `Widgets` menu for generating an HTML snippet
that can be embedded into any static web page:

The menu provides three sets of actions

 - Save Notebook Widget State and Clear Notebook Widget State
 - Download Widget State
 - Embed Widgets

### Save Notebook Widget State

A notebook file may be saved with the current widget state as metadata. This allows the notebook file to be rendered with rendered widgets (see the section about Sphinx below, for example). To save a notebook with the current widget state, use the `Save Notebook Widget State` menu item.

In order to delete old saved state and save new state to the notebook, do the following in order:

1. Use the `Clear Notebook Widget State` menu and save the notebook. This clears the metadata from the notebook file.
2. Restart the kernel and refresh the page. This clears the old widget state from the widget manager on the page.
3. Create whatever widgets you'd like, and use `Save Notebook Widget State` and save the notebook. This saves the new widget state to the notebook file.

### Embeddable HTML Snippet

The `Embed widgets` menu item provides a dialog containing an HTML page
which embeds the current widgets. In order to support custom widgets, it uses the RequireJS embedder.

This HTML snippet is composed of multiple `<script>` tags embedded into an HTML document:

 - The first script tag loads RequireJS from a CDN. If you already have RequireJS on the page, you can delete this script tag.

 - The second script tag loads the RequireJS widget embedder. This defines appropriate modules and then sets up a function to render all of the widget views included on the page. If you are only embedding standard widgets and do not want to use RequireJS, you can replace these first two script tags with a script tag loading the standard embedder.

 - The next script tag is a script tag with mime type
   `application/vnd.jupyter.widget-state+json` that contains the state of all
   the widget models currently in use. The JSON schema for the content of this
   script tag is found in the `@jupyter-widgets/schema` npm package.

- Then there are a number of script tags, each with mime type
  `application/vnd.jupyter.widget-view+json`, corresponding to the views which
  you want to display in the web page. These script tags must be in the body of
  the page, and are replaced with the rendered widgets. The JSON schema for the
  content of these script tags is found in the `@jupyter-widgets/schema` npm
  package.

  The *Embed Widgets* action currently creates one of these script tags for each
  view displayed in the notebook. If you'd like to lay out the views, or include
  only some of them, you can delete or include these script tags as you wish.

In order to clear widget state from the frontend so that it does not show up in the embedding, restart the kernel and then refresh the page, in that order.

### Widget State JSON

The `Download Widget State` option triggers the downloading of a JSON file
containing the serialized state of all the widget models currently in use, using
the `application/vnd.jupyter.widget-state+json` format specified in the
`@jupyter-widgets/schema` npm package.

## Python interface

Embeddable code for the widgets can also be produced from Python. The
`ipywidgets.embed` module provides several functions for embedding widgets
into HTML documents programatically.

Use `embed_minimal_html` to create a simple, stand-alone HTML page:

```python
from ipywidgets import IntSlider
from ipywidgets.embed import embed_minimal_html

slider = IntSlider(value=40)
embed_minimal_html('export.html', views=[slider], title='Widgets export')
```

This creates the stand-alone file `export.html`. To view the file, either
start an HTTP server, such as the [HTTP
server](https://docs.python.org/3.6/library/http.server.html#module-http.server)
in the Python standard library, or just open it in your web browser (by
double-clicking on the file, or by writing `file:///path/to/file` in your
browser search bar).

You will sometimes want greater granularity than that afforded by
`embed_minimal_html`. Often, you want to control the structure of the HTML
document in which the widgets are embedded. For this, use `embed_data` to get
JSON exports of specific parts of the widget state. You can embed these in an
HTML template:

```py
import json

from ipywidgets import IntSlider
from ipywidgets.embed import embed_data

s1 = IntSlider(max=200, value=100)
s2 = IntSlider(value=40)
data = embed_data(views=[s1, s2])

html_template = """
<html>
  <head>

    <title>Widget export</title>

    <!-- Load RequireJS, used by the IPywidgets for dependency management -->
    <script 
      src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.4/require.min.js" 
      integrity="sha256-Ae2Vz/4ePdIu6ZyI/5ZGsYnb+m0JlOmKPjt6XZ9JJkA=" 
      crossorigin="anonymous">
    </script>

    <!-- Load IPywidgets bundle for embedding. -->
    <script
      data-jupyter-widgets-cdn="https://cdn.jsdelivr.net/npm/"
      src="https://unpkg.com/@jupyter-widgets/html-manager@*/dist/embed-amd.js" 
      crossorigin="anonymous">
    </script>

    <!-- The state of all the widget models on the page -->
    <script type="application/vnd.jupyter.widget-state+json">
      {manager_state}
    </script>
  </head>

  <body>

    <h1>Widget export</h1>

    <div id="first-slider-widget">
      <!-- This script tag will be replaced by the view's DOM tree -->
      <script type="application/vnd.jupyter.widget-view+json">
        {widget_views[0]}
      </script>
    </div>

    <hrule />

    <div id="second-slider-widget">
      <!-- This script tag will be replaced by the view's DOM tree -->
      <script type="application/vnd.jupyter.widget-view+json">
        {widget_views[1]}
      </script>
    </div>

  </body>
</html>
"""

manager_state = json.dumps(data['manager_state'])
widget_views = [json.dumps(view) for view in data['view_specs']]
rendered_template = html_template.format(manager_state=manager_state, widget_views=widget_views)
with open('export.html', 'w') as fp:
    fp.write(rendered_template)
```

The web page needs to load RequireJS and the Jupyter widgets HTML manager.
You then need to include the manager state in a `<script>` tag of type
`application/vnd.jupyter.widget-state+json`, which can go in the head of the
document. For each widget view, place a `<script>` tag of type
`application/vnd.jupyter.widget-view+json` in the DOM element that should
contain the view. The widget manager will replace each `<script>` tag with
the DOM tree corresponding to the widget.

In this example, we used a Python string for the template, and used the
`format` method to interpolate the state. For embedding in more complex
documents, you may want to use a templating engine like
[Jinja2](http://jinja.pocoo.org/).

We also change the CDN from its default of unpkg to use jsdelivr by setting the
`data-jupyter-widgets-cdn` attribute.

In all embedding functions in `ipywidgets.embed`, the state of all widgets
known to the widget manager is included by default. You can alternatively
pass a reduced state to use instead. This can be particularly relevant if you
have many independent widgets with a large state, but only want to include
the relevant ones in your export. To include only the state of specific views
and their dependencies, use the function `dependency_state`:

```py
from ipywidgets.embed import embed_minimal_html, dependency_state

s1 = IntSlider(max=200, value=100)
s2 = IntSlider(value=40)
embed_minimal_html('export.html', views=[s1, s2], state=dependency_state([s1, s2]))
```

## Embedding Widgets in the Sphinx HTML Documentation

As of ipywidgets 6.0, Jupyter interactive widgets can be rendered in Sphinx html
documentation. Two means of achieving this are provided:

### Using the Jupyter Sphinx Extension

The [jupyter_sphinx](https://jupyter-sphinx.readthedocs.io) extension
enables jupyter-specific features in sphinx. It can be installed with `pip` and
`conda`.

In the `conf.py` sphinx configuration file, add `jupyter_sphinx`
to the list of enabled extensions.

Then use the `jupyter-execute` directive to embed the output of code execution
in your documentation

```rst
.. jupyter-execute::

  from ipywidgets import VBox, jsdlink, IntSlider, Button
  s1, s2 = IntSlider(max=200, value=100), IntSlider(value=40)
  b = Button(icon='legal')
  jsdlink((s1, 'value'), (s2, 'max'))
  VBox([s1, s2, b])
```

### Using the `nbsphinx` Project

The [nbsphinx](https://nbsphinx.readthedocs.io/) Sphinx extension
provides a source parser for `*.ipynb` files. Custom Sphinx directives are used
to show Jupyter Notebook code cells (and of course their results) in both HTML
and LaTeX output.
In the case of the HTML output, Jupyter Interactive Widgets are also supported.

For notebooks that are executed by `nbsphinx` the widget state is automatically
generated.
For others, it is a requirement that the notebook was correctly saved with the
special "Save Notebook Widget State" action in the widgets menu.

The necessary JavaScript code is automatically embedded in the generated HTML
files.
A custom URL or a local JavaScript file can be specified with the
`nbsphinx_widgets_path` configuration option.
For more configuration options, have a look at the
[documentation](https://nbsphinx.readthedocs.io/usage.html).

## Rendering Interactive Widgets on [nbviewer](http://nbviewer.jupyter.org/)

If your notebook was saved with the special "Save Notebook Widget State" action
in the Widgets menu, interactive widgets displayed in your notebook should also
be rendered on nbviewer.

See e.g. the [Widget List](http://nbviewer.jupyter.org/github/jupyter-widgets/ipywidgets/blob/master/docs/source/examples/Widget%20List.ipynb)
example from the documentation.

## The Case of Custom Widget Libraries

Custom widgets can also be rendered on nbviewer, static HTML and RTD
documentation. An illustration of this is the http://jupyter.org/widgets
gallery.

The widget embedder attempts to fetch the model and view implementation of the
custom widget from the npm CDN https://unpkg.com by default. The URL that is requested
for, e.g. the `bqplot` module name, with the semver range `^2.0.0` is

`https://unpkg.com/bqplot@^2.0.0/dist/index.js`

which holds the webpack bundle for the bqplot library.

While the default CDN is using https://unpkg.com it can be configured by
setting the optional `data-jupyter-widgets-cdn` attribute for script tag which loads `embed-amd.js`,
as shown in the example above.

The [widget-cookiecutter](https://github.com/jupyter/widget-cookiecutter)
template project contains a template project for a custom widget library
following the best practices for authoring widgets, which ensure that your
custom widget library can render on nbviewer.

## Using `jupyter-widgets-controls` in web contexts

The core `jupyter-widgets-controls` library, the JavaScript package of ipywidgets, is
agnostic to the context in which it is used (Notebook, JupyterLab, static web
page). For each context, we specialize the base widget manager implemented in
`@jupyter-widgets/base` to provide the logic for

 - where widgets should be displayed,
 - how to retrieve information about their state.

Specifically:

 - The `widgetsnbextension` Python package provides the implementation of a specialized widget
   manager for the classic Jupyter notebook, and the packaging logic as a notebook
   extension.
 - The `@jupyter-widgets/jupyterlab-manager` npm package provides the implementation of a specialized widget
   manager for the context of `JupyterLab`, and the packaging logic as a lab
   extension.
 - The embed manager implemented in the `@jupyter-widgets/html-manager` npm package is a specialization of
   the base  widget manager used for the static embedding of widgets used by
   the `Sphinx` extension, `nbviewer`, and the "Embed Widgets" command
   discussed above.

We provide [additional examples](https://github.com/jupyter-widgets/ipywidgets/tree/master/examples) of specializations of the base widget manager
implementing other usages of Jupyter widgets in web contexts.

1. The [`web1`](https://github.com/jupyter-widgets/ipywidgets/tree/master/examples/web1) example is a simplistic example showcasing the use of
   Jupyter widgets in a web context.
2. The [`web2`](https://github.com/jupyter-widgets/ipywidgets/tree/master/examples/web2) example is a simple example making use of the
   `application/vnd.jupyter.widget-state+json` mime type.
3. The [`web3`](https://github.com/jupyter-widgets/ipywidgets/tree/master/examples/web3) example showcases how communication with a Jupyter kernel can
   happen in a web context outside of the notebook or jupyterlab contexts.
4. The [`web-tmpnb`](https://github.com/jupyter-widgets/ipywidgets/tree/master/examples/web-tmpnb) example makes use of the `tmpnb` service to spawn a Jupyter
   server, request a kernel from this server and implement the same feature as
   the `web3` example.

