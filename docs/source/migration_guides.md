# Migrating custom widget libraries

These are migration guides specifically for developers of third-party
widgets.

## Migrating from 7.x to 8.0

In this section, we discuss migrating a custom widget from ipywidgets 7 to
ipywidgets 8 or supporting both ipywidgets 7 and ipywidgets 8 with the same
codebase.

For a summarized list of changes affecting custom widget authors, please see the "Developers" section of the
[changelog](./changelog) for 8.0.

Please consider updating your widget by generating a new widget from the [JavaScript widget cookiecutter](https://github.com/jupyter-widgets/widget-cookiecutter) and adapting the code to your widget, since the cookiecutter has been updated to use best practices in Python packaging and Jupyter Widget infrastructure.

For example migrations, see these PRs:

- [ts-cookiecutter](https://github.com/jupyter-widgets/widget-ts-cookiecutter/pull/115)
- [ipydatagrid](https://github.com/bloomberg/ipydatagrid/pull/282)
- [bqplot](https://github.com/bqplot/bqplot/pull/1404)
- [ipyleaflet](https://github.com/jupyter-widgets/ipyleaflet/pull/968)
- [bqscales](https://github.com/bqplot/bqscales/pull/49)
- [sidecar](https://github.com/jupyter-widgets/jupyterlab-sidecar/pull/86)
- [pythreejs](https://github.com/jupyter-widgets/pythreejs/pull/378)

### Updating setup.py

Start by updating the dependency in your `setup.py` or `setup.cfg` to support 8.x.

_e.g._

```diff
 install_requires=[
-    'ipywidgets>=7,<8',
+    'ipywidgets>=7,<9',
 ],
```

### Updating package.json

Next, you should update the JavaScript dependencies. You will need to update
your `@jupyter-widgets/base` dependency and the `@jupyter-widgets/controls` **if**
you depend on it.

The diff will look like the following in case you still want to support ipywidgets<8:

```diff
- "@jupyter-widgets/base": "^2 || ^3 || ^4",
+ "@jupyter-widgets/base": "^2 || ^3 || ^4 || ^5 || ^6",
```

You can also apply the following diff if you only want to support ipywidgets==8 from now on:

```diff
- "@jupyter-widgets/base": "^2 || ^3 || ^4",
+ "@jupyter-widgets/base": "^6",
```

Note that "@jupyter-widgets/base" version 5 is reserved for **ipywidgets 7 support on JupyterLab 4**, "@jupyter-widgets/base" version 6 is the version released with ipywidgets 8.

The `ManagerBase` class has been split into an interface type `IWidgetManager` which remains in the `@jupyter-widgets/base` package, and its implementation which has moved to the new `@jupyter-widgets/base-manager` package. So if you subclass the `ManagerBase` class, you will need to add a new dependency in your `package.json` as following, and update your imports accordingly.

```diff
+ "@jupyter-widgets/base-manager": "^1",
```

### Updating the webpack `publicPath` configuration

We highly encourage you to update your widget's webpack configuration for `publicPath`, which is used in generating AMD modules, with changes similar to [these changes](https://github.com/jupyter-widgets/widget-cookiecutter/pull/103/files). These changes allow your AMD module to be hosted anywhere, rather than hardcoding the a particular CDN like `unpkg.com`, and they simplify things by removing the differences between the AMD module generated for the notebook extension and the AMD module generated for the CDN.

### Updating the browser code

#### Phosphor -> Lumino

The Phosphor library has been archived. It has been forked and renamed [Lumino](https://github.com/jupyterlab/lumino), and the maintenance is now done under the JupyterLab governance.

If you used to import classes like `JupyterPhosphorPanelWidget` and `JupyterPhosphorWidget` from the `@jupyter-widgets/base` library, you will need to update them:

```diff
- import { JupyterPhosphorPanelWidget, JupyterPhosphorWidget } from '@jupyter-widgets/base';
+ import { JupyterLuminoPanelWidget, JupyterLuminoWidget } from '@jupyter-widgets/base';
```

The `DOMWidgetView.pWidget` property has been renamed `DOMWidgetView.luminoWidget` (though an alias for `pWidget` is available for conveniance):

```diff
- this.pWidget
+ this.luminoWidget
```

The `DOMWidgetView.processPhosphorMessage` method has been renamed `DOMWidgetView.processLuminoMessage`. If you want to support both ipywidgets 7.x and 8.x, you should implement both methods and call the correct super method:

```diff
- processPhosphorMessage(msg: Message): void {
-     super.processPhosphorMessage(msg);
-     switch (msg.type) {
-     case 'resize':
-         this.resize();
-         break;
-     }
- }
+ _processLuminoMessage(msg: Message, _super: (msg: Message) => void): void {
+     _super.call(this, msg);
+     switch (msg.type) {
+     case 'resize':
+         this.resize();
+         break;
+     }
+ }
+
+ processPhosphorMessage(msg: Message): void {
+     this._processLuminoMessage(msg, super.processPhosphorMessage);
+ }
+
+ processLuminoMessage(msg: Message): void {
+     this._processLuminoMessage(msg, super.processLuminoMessage);
+ }
```

If you're dropping ipywidgets 7.x support, you can simply rename the `processPhosphorMessage` method to `processLuminoMessage`.

#### Widget manager import

As mentioned before, if you depend on the `ManagerBase` class, you will **either** need to update the import:

```diff
- import { ManagerBase } from '@jupyter-widgets/base';
+ import { ManagerBase } from '@jupyter-widgets/base-manager';
```

**or**, switch to using the new `IWidgetManager` interface in the `base` package:

```diff
- import { ManagerBase } from '@jupyter-widgets/base';
+ import { IWidgetManager } from '@jupyter-widgets/base';
```

Which one to pick depends on how you use it. If you are using it as the base class for your own implementation of a widget manager, and want to subclass it in order to reuse the methods/logic in that implementation, you should depend on the `base-manager` package. If you are only interested in the TypeScript type for a widget manager, e.g. for use in the arguments of a deserializer function, you should use the `IWidgetManager` interface type.

Typescript trick:
If you need to support a deserializer function against both ipywidgets 7 and older and the new version 8, you can change your deserializer function to have the following signature:

```diff
- import { ManagerBase } from '@jupyter-widgets/base';
+ import { unpack_models } from '@jupyter-widgets/base';

export async function myDeserializer(
  obj: MyObjectType,
-  manager?: ManagerBase
+  manager?: Parameters<typeof unpack_models>[1]
): Promise<JSONValue> {
```

#### Backbone extend

The version of [Backbone.js](https://backbonejs.org/) that ipywidgets depends on has changed from 1.2.3 to 1.4.0. If you were extending the base widget model with `var CustomWidgetModel = Widget.extend({ ... });` you will need to update the class definition using the ES6 notation:

```diff
- var CustomWidgetModel = Widget.extend({
-     ...
- });
+ class CustomWidgetModel extends Widget {
+     ...
+ }
```

If you were using `.extend()`, you will also need to change how your model attribute defaults are defined. The model defaults are now given by a function that returns the defaults and includes the superclass defaults. For example, the Output widget model [looks like this](https://github.com/jupyter-widgets/ipywidgets/blob/8.0.0/packages/output/src/output.ts):

```javascript
export const OUTPUT_WIDGET_VERSION = '1.0.0';

export class OutputModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: 'OutputModel',
      _view_name: 'OutputView',
      _model_module: '@jupyter-widgets/output',
      _view_module: '@jupyter-widgets/output',
      _model_module_version: OUTPUT_WIDGET_VERSION,
      _view_module_version: OUTPUT_WIDGET_VERSION,
    };
  }
}
```

#### Custom tag names

If you were changing the base HTML tag for your widget by defining the `tagName` property, this can now be done in ipywidgets 8 in the `preinitialize` method (see [here](https://github.com/jupyter-widgets/ipywidgets/commit/a342e0dbc7c779bb668e5a21c097d7cec9a6ac44) for example changes in core widgets):

```diff
- get tagName() {
-   return 'button';
- }
+ preinitialize() {
+   this.tagName = 'button';
+ }
```

If you need compatibility with ipywidgets 7, continue using the `get tagName` accessor instead of `preinitialize`. However, newer versions of Typescript will complain that you are overriding a property with a function. If you want to maintain compatibility with both ipywidgets 7 and ipywidgets 8, and you are using Typescript, you can add a `ts-ignore` directive to mollify Typescript, like is done in [ipydatawidgets](https://github.com/vidartf/ipydatawidgets/blob/489586982c375c03d5ffd3089dd4f427c8266443/packages/jupyter-datawidgets/src/media.ts#L131):

```diff
+ // @ts-ignore: 2611
  get tagName() {
    return 'button';
  }
```

## Migrating from 6.0 to 7.0

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

Start by updating the dependency in your `setup.py` to the latest release. To
find the correct version number, go to the [releases
page](https://github.com/jupyter-widgets/ipywidgets/releases) on Github and
cycle through the tags until you see the latest 7.0.0 tag.

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

```
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
widgets = require('@jupyter-widgets/base');
```

```javascript
require(['@jupyter-widgets/base'], function (widgets) {});
```

```javascript
import * as widgets from '@jupyter-widgets/base';
```

All your widget models should also declare the attributes
`_view_module_version` and `_model_module_version`. A minimal model now looks like:

```javascript
var HelloModel = widgets.DOMWidgetModel.extend({
  defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
    _model_name: 'HelloModel',
    _view_name: 'HelloView',
    _model_module: 'example_module',
    _view_module: 'example_module',
    _model_module_version: '~1.0.0',
    _view_module_version: '~1.0.0',
  }),
});
```

For embedding to work correctly, the module version needs to be a [semantic
version range](https://docs.npmjs.com/getting-started/semantic-versioning)
that matches a release on NPM. The most common pattern is to request a
version compatible with the version currently in your `package.json` by using,
`~{{ version number }}` for `_model_module_version` and `_view_module_version`. See the [cookiecutter
template](https://github.com/jupyter-widgets/widget-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/js/lib/example.js#L24)
for details.

Since you probably want to avoid repeating the module version in every
widget, a common pattern is to import the version from `package.json` and
prepend a `~`. See
[ipyvolume](https://github.com/widgetti/ipyvolume/blob/master/js/src/figure.ts)
for an example. If you do this, make sure that your webpack configuration
includes a JSON loader. See the Webpack configuration for
[ipyvolume](https://github.com/widgetti/ipyvolume/blob/master/js/webpack.config.js#L7)
for an example.

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
bundle at `https://cdn.jsdelivr.net/npm/<module-name>@<module-version>/dist/index.js`
when it finds a widget.

### Updating embedded widgets

There are now two options for embedding widgets in an HTML page outside of the notebook.

#### Embedding the standard widgets

If you are just embedding the standard widgets that come with ipywidgets, then you can simply include the following script tag:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@jupyter-widgets/html-manager@*/dist/embed.js"
  crossorigin="anonymous"
></script>
```

If you want to use a specific version of the embedder, you replace the `@*` with a semver range, such as `@^0.9.0`

#### Embedding custom widgets with RequireJS

In order to embed third-party widgets, you can use the RequireJS-based embedding. First, make sure that RequireJS is loaded on the page, for example:

```html
<!-- Load require.js. Delete this if your page already loads require.js -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.4/require.min.js"
  integrity="sha256-Ae2Vz/4ePdIu6ZyI/5ZGsYnb+m0JlOmKPjt6XZ9JJkA="
  crossorigin="anonymous"
></script>
```

Then include the following script, which defines the embedding libraries and runs the function to render widgets:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@jupyter-widgets/html-manager@*/dist/embed-amd.js"
  crossorigin="anonymous"
></script>
```

If you want to use a specific version of the embedder, you replace the `@*` with a semver range, such as `@^0.9.0`

If you need to embed custom widgets without using RequireJS, you'll need to compile your own embedding javascript that includes the third-party libraries.
