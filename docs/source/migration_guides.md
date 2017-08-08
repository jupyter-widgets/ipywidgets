Migrating custom widget libraries
=================================

These are migration guides aimed specifically at developers of third-party
widgets.

Migrating from 6.0 to 7.0
-------------------------

For example migrations, see these PRs:
 - [ipyleaflet](https://github.com/ellisonbg/ipyleaflet/pull/66)
 - [jupyter-gmaps](https://github.com/pbugnion/gmaps/pull/166)
 - bqplot: [PR #458](https://github.com/bloomberg/bqplot/pull/458), [PR #497](https://github.com/bloomberg/bqplot/pull/497) and [PR #501](https://github.com/bloomberg/bqplot/pull/501)

To avoid tying your development cycle to ipywidgets, we recommend starting
the migration on a branch and keeping that branch open until ipywidgets 7.0
is released. 

We also recommend testing the migration in a completely new notebook, rather
than one that contains widgets that you instantiated with ipywidgets 6.0.

### Updating setup.py

Start by updating the dependency in your `setup.py` to the latest beta. To
find the correct version number, go to the [releases
page](https://github.com/jupyter-widgets/ipywidgets/releases) on Github and
cycle through the tags until you see a tag called `7.0.0bx` or `7.0.0rcx`.

### Updating package.json

Next, we should update the JavaScript dependencies. The most important change
for widget developers is that the JavaScript package for jupyter-widgets has
been split between `@jupyter-widgets/base` and `@jupyter-widgets/controls`: 
 - `@jupyter-widgets/base` contains the base widget classes and the layout
classes 
 - `@jupyter-widgets/controls` contains the widget classes for the
user-facing widgets.

In your `package.json`, remove `jupyter-js-widgets` from your dependencies
and add `@jupyter-widgets/base`. To find the correct version, go to the
[releases page](https://github.com/jupyter-widgets/ipywidgets/releases) and
cycle through the tags until you see a tag called
`@jupyter-widgets/base@<version>`. Do the same for
`@jupyter-widgets/controls` if you think you have a dependency on it (e.g. if
you create widgets that inherit from `VBox` or `HBox` or another user-facing widget).

### Updating Webpack configuration

If you use Webpack to build the client-side library, your Webpack
configuration file (probably at `js/webpack.config.json`) declares
`jupyter-js-widgets` as an external dependency. You will need to change this
in both the bundle for the notebook and the embeddable bundle. If you just
need `@jupyter-widgets/base`, your external dependencies would be:

```json
externals: ['@jupyter-widgets/base']
```

If you need both `@jupyter-widgets/base` and `@jupyter-widgets/controls`, include
both packages in the array.

The [cookiecutter template](https://github.com/jupyter-widgets/widget-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/js/webpack.config.js) provides a sample configuration.

### Updating the client-side code

If you now build the client-side code of your library, you will get many
errors about missing `jupyter-js-widgets` dependencies. You need to replace
every import of `jupyter-js-widgets` with an import of
`@jupyter-widgets/base` (or, possibly, an import of `@jupyter-widgets/controls`).

Your imports should now look like one of the following (depending on how you normally import other modules):

```javascript
widgets = require('@jupyter-widgets/base')
```

```javascript
require(['@jupyter-widgets/base'], function(widgets) {
})
```

```javascript
import * as widgets from '@jupyter-widgets/base'
```

### Updating the notebook extension

Previously, the notebook extension (normally `js/src/extension.js`) required
defining `jupyter-js-widgets` in the configuration for `requirejs`. This is
no longer needed. See the [cookiecutter
template](https://github.com/jupyter-widgets/widget-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/js/src/extension.js)
for an example of the correct `requirejs` configuration.

### Updating the Python code

All widgets need to declare the following six traitlets:

```py
class ExampleWidget(widgets.Widget):
    _model_name = Unicode('name of model in JS')
    _view_name = Unicode('name of view in JS')
    _model_module = Unicode('name your JS package')
    _view_module = Unicode('name your JS package')
    _model_module_version = Unicode('version of your JS bundle')
    _view_module_version = Unicode('version of your JS bundle')
```

It is likely that your widgets already declared a `_model_name`,
`_view_name`, `_model_module` and `_view_module`. The `_model_module` and
`_view_module` should be the name of your package on NPM (the value of the
`name` field in your `package.json`). The `_model_module_version` and
`_view_module_version` should be the version of your JavaScript client (the
values of the `version` field in your `package.json`).

The `_model_module_version` and `_view_module_version` are used to find your
JavaScript bundle when embedding widgets. The embed manager will look for the
bundle at `https://unpkg.com/<module-name>@<module-version>/dist/index.js`
when it finds a widget.

### Updating links

If your code or your documentation references the link for the jupyter-widgets script
that loads widgets embedded outside the notebook, 
this has changed to `https://unpkg.com/@jupyter-widgets/html-manager@*/dist/embed.js`.