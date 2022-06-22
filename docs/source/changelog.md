ipywidgets changelog
====================

A summary of changes in ipywidgets. For more detailed information, see the issues and pull requests for the appropriate milestone on [GitHub](https://github.com/jupyter-widgets/ipywidgets).

7.7.1
-----

To see the full list of pull requests, see the [7.7.1 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/36?closed=1) on GitHub.

Highlights include:

- Fix broken link icon for FontAwesome 4 and 5 [#3495](https://github.com/jupyter-widgets/ipywidgets/pull/3495)
- Fix message throttling bug [#3494](https://github.com/jupyter-widgets/ipywidgets/pull/3494)
- Fix state message parsing to be more permissive [#3486](https://github.com/jupyter-widgets/ipywidgets/pull/3486)
- Fix tests on Python 3.11 [#3480](https://github.com/jupyter-widgets/ipywidgets/pull/3480)
- Add better front-page docs [#3496](https://github.com/jupyter-widgets/ipywidgets/pull/3496)

7.7
---

To see the full list of pull requests and issues, see the [7.7 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/35?closed=1) on GitHub.

Highlights include:

- Fix installation on Python 3.10. [#3368](https://github.com/jupyter-widgets/ipywidgets/pull/3368)
- Throw an error if we cannot render a widget, enabling the rendering system to fall back to rendering a different data type if available. [#3290](https://github.com/jupyter-widgets/ipywidgets/pull/3290)
- Create a new widget control comm channel, enabling more efficient fetching of kernel widget state. [#3201](https://github.com/jupyter-widgets/ipywidgets/pull/3021)
- Refactor logic for fetching kernel widget state to the manager base class. This logic first tries to use the new widget control comm channel, falling back to the existing method of requesting each widget's state individually. [#3337](https://github.com/jupyter-widgets/ipywidgets/pull/3337)
- Enable HTMLManager output widgets to render state updates. [#3372](https://github.com/jupyter-widgets/ipywidgets/pull/3372)
- Do not reset JupyterLab CSS variables if they are already defined. [#3344](https://github.com/jupyter-widgets/ipywidgets/pull/3344)
- Fix variable inspector example. [#3302](https://github.com/jupyter-widgets/ipywidgets/pull/3302)
- Introduce new widget manager `has_model` method for synchronously checking if a widget model is registered. [#3377](https://github.com/jupyter-widgets/ipywidgets/pull/3377)
- Work around bug in Chrome rendering Combobox arrows. [#3375](https://github.com/jupyter-widgets/ipywidgets/pull/3375)
- Optionally echo update messages from frontends to other frontends. This enables widget views in different frontends to maintain consistent state simultaneously, and also makes sure that simultaneous updates from the kernel and frontend resolve to a consistent state. This is off by default in ipywidgets 7.7, and it is anticipated this will be on by default in ipywidgets 8.0. To enable echo update messages across ipwyidgets, set the environment variable `JUPYTER_WIDGETS_ECHO` to 1. To opt a specific attribute out of echo updates, tag the attribute with `echo_update=False` metadata (we do this in core for the FileUpload widget's `data` attribute). [#3400](https://github.com/jupyter-widgets/ipywidgets/pull/3400)

7.6
---

To see the full list of pull requests and issues, see the [7.6.0 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/31?closed=1) on GitHub.

The main change in this release is that installing `ipywidgets` 7.6.0 will now automatically enable ipywidgets support in JupyterLab 3.0—a user has no extra JupyterLab installation step and no rebuild of JupyterLab, nor do they need Node.js installed. Simply install the python ipywidgets package with pip (`pip install ipywidgets==7.6.0`) or conda/mamba (`conda install -c conda-forge ipywidgets=7.6.0`) and ipywidgets will automatically work in classic Jupyter Notebook and in JupyterLab 3.0.

This is accomplished with the new python package `jupyterlab_widgets` version 1.0, on which `ipywidgets` 7.6.0 now depends (similar to how `ipywidgets` already depends on the `widgetsnbextension` package to configure ipywidgets for the classic Jupyter Notebook). The `jupyterlab_widgets` Python package is a JupyterLab 3.0 prebuilt extension, meaning that it can be installed into JupyterLab 3.0 without rebuilding JupyterLab and without needing Node.js installed.

### Updates for Widget Maintainers

Custom widget maintainers will need to make two changes to update for JupyterLab 3:

1. Update the `@jupyter-widgets/base` dependency version to include `^4` to work in JupyterLab 3.0. For example, if you had a dependency on `@jupyter-widgets/base` version `^2 || ^3`, update to `^2 || ^3 || ^4` for your widget to work in classic Jupyter Notebook, JupyterLab 1, JupyterLab 2, and JupyterLab 3. See [#2472](https://github.com/jupyter-widgets/ipywidgets/pull/2472) for background.
2. In the `package.json`, add the following `sharedPackages` configuration inside the `jupyterlab` key. See the [JupyterLab extension documentation](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html#requiring-a-service) for more information.

   ```json
     "jupyterlab": {
       "sharedPackages": {
         "@jupyter-widgets/base": {
           "bundled": false,
           "singleton": true
         }
       }
     }
   ```

Separate from these two steps to update for JupyterLab 3, we also recommend that you make your widget's JupyterLab extension a prebuilt extension for JupyterLab 3.0. Users will be able to install your JupyterLab 3.0 prebuilt extension without rebuilding JupyterLab or needing Node.js. See the [JupyterLab 3 extension developer documentation](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html) or the new [widget extension cookiecutter](https://github.com/jupyter-widgets/widget-ts-cookiecutter/tree/jlab3) for more details.


7.5
---

To see the full list of pull requests and issues, see the [7.5 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/268?closed=1) on GitHub.

Changes include:

- New `AppLayout` and `GridLayout` templates for positioning interactive widgets. [#2333](https://github.com/jupyter-widgets/ipywidgets/pull/2333)
- New `FileUpload` widget allowing users to upload files from the browser. [#2258](https://github.com/jupyter-widgets/ipywidgets/pull/2258)
- New `ComboBox` widget. [#2390](https://github.com/jupyter-widgets/ipywidgets/pull/2390)
- JupyterLab CSS variables are now exposed by default even in the case of the classic notebook. [#2418](https://github.com/jupyter-widgets/ipywidgets/pull/2418)

### Updates for Widget Maintainers

Custom widget maintainers will need to update their `@jupyter-widgets/base` dependency version to work in JupyterLab 1.0. For example, if you had a dependency on `@jupyter-widgets/base` version `^1.1`, update to `^1.1 || ^2` for your widget to work in classic notebook, JupyterLab 0.35, and JupyterLab 1.0. See [#2472](https://github.com/jupyter-widgets/ipywidgets/pull/2472) for background.


7.4
---

To see the full list of pull requests and issues, see the [7.4 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/26?closed=1) on GitHub.

Changes include:

- New `Video` and `Audio` widgets have been introduced. [#2162](https://github.com/jupyter-widgets/ipywidgets/pull/2162)
We updated the `@jupyter-widgets/controls` widget specification version to `1.4.0`, leading to the version bump to 7.4.
- The use of mappings for the `options` attribute of selection widgets is deprecated. [#2130](https://github.com/jupyter-widgets/ipywidgets/pull/2130)

7.3
---

To see the full list of pull requests and issues, see the [7.3 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/26?closed=1) on GitHub.

Changes include:

- A new `GridBox` widget is introduced and associated CSS grid properties are added to the layout. This enables using the CSS Grid spec for laying out widgets. See the [Widget Styling](http://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Styling.html) documentation for some examples. Because of this and other model specification changes, the view and module versions of widgets was incremented in both the base and controls packages. ([#2107](https://github.com/jupyter-widgets/ipywidgets/pull/2107), [#2064](https://github.com/jupyter-widgets/ipywidgets/pull/2064), [#1942](https://github.com/jupyter-widgets/ipywidgets/issues/1942))

- Widgets with a `description` attribute now also have a `description_tooltip` attribute to set a tooltip on the description. The tooltip defaults to the description text. Setting `description_tooltip` to `''` removes it, and setting it to `None` makes the tooltip default to the description text. ([#2070](https://github.com/jupyter-widgets/ipywidgets/pull/2070))

- `'transparent'` is now a valid color for color attributes. ([#2128](https://github.com/jupyter-widgets/ipywidgets/pull/2128))

- Dropdowns now have extra padding to make room for the dropdown arrow. ([#2052](https://github.com/jupyter-widgets/ipywidgets/issues/2052), [#2101](https://github.com/jupyter-widgets/ipywidgets/pull/2101))

- Image widget `repr` now truncates the image value to prevent huge amounts of output in notebooks. ([#2111](https://github.com/jupyter-widgets/ipywidgets/pull/2111))

- Python 3.3 support is dropped. Python 3.3 support was dropped in the Python community in [September 2017](https://www.python.org/dev/peps/pep-0398/#x-end-of-life). ([#2129](https://github.com/jupyter-widgets/ipywidgets/pull/2129))

- The license information has been consolidated into the LICENSE file, and the COPYING.md file is removed. If you are repackaging ipywidgets or widgetsnbextension, please make sure to include LICENSE instead of COPYING.md. ([#2133](https://github.com/jupyter-widgets/ipywidgets/pull/2133), [#2048](https://github.com/jupyter-widgets/ipywidgets/pull/2048), [#1701](https://github.com/jupyter-widgets/ipywidgets/issues/1701), [#1706](https://github.com/jupyter-widgets/ipywidgets/pull/1706))

7.2
---

To see the full list of pull requests and issues, see the [7.2 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/25?closed=1) on GitHub.

User-visible changes include:

- A new `FloatLogSlider` widget is a slider with a log scale, suitable for exploring a wide range of magnitudes. ([#1928](https://github.com/jupyter-widgets/ipywidgets/pull/1928), [#2014](https://github.com/jupyter-widgets/ipywidgets/pull/2014))
  ```python
  from ipywidgets import FloatLogSlider
  FloatLogSlider()
  ```
- `link` and `dlink` are now exported from ipywidgets for convenience, so that you can import them directly from ipywidgets instead of needing to import them from traitlets. ([#1923](https://github.com/jupyter-widgets/ipywidgets/pull/1923))
- A new option `manual_name` has been added to `interact_manual()` to change the name of the update button, for example `interact_manual(manual_name='Update')`. ([#1924](https://github.com/jupyter-widgets/ipywidgets/pull/1923))
- The Output widget now has a `.capture()` method, which returns a decorator to capture the output of a function.
  ```python
  from ipywidgets import Output
  out = Output()

  @out.capture()
  def f():
    print('This output is captured')
  ```
  The `.capture()` method has a `clear_output` boolean argument to automatically clear the output every time the function is run, as well as a `wait` argument corresponding to the `clear_output` wait argument. ([#1934](https://github.com/jupyter-widgets/ipywidgets/pull/1934))
- The Output widget has much more comprehensive documentation in its own section. ([#2020](https://github.com/jupyter-widgets/ipywidgets/pull/2020))
- Installing `widgetsnbextension` now automatically enables the nbextension in Jupyter Notebook 5.3 or later. ([#1911](https://github.com/jupyter-widgets/ipywidgets/pull/1911))
- The default rendering of a widget if widgets are not installed is now a short description of the widget in text instead of a much longer HTML message. ([#2007](https://github.com/jupyter-widgets/ipywidgets/pull/2007))

Changes for developers include:

- The JavaScript base widget manager class now has a `resolveUrl` method to resolve a URL relative to the current notebook location. ([#1993](https://github.com/jupyter-widgets/ipywidgets/pull/1993))
- The html manager now exposes a way to specify which JavaScript file is fetched for a package and the loader used to fetch the library. ([#1995](https://github.com/jupyter-widgets/ipywidgets/pull/1995), [#1998](https://github.com/jupyter-widgets/ipywidgets/pull/1998))
- The `@jupyter-widgets/controls` widget specification version was bumped to `1.2.0`. Changes include the FloatLogSlider widget and more specific documentation about array element types. ([#2017](https://github.com/jupyter-widgets/ipywidgets/pull/2017))

7.1
---

To see the full list of pull requests and issues, see the [7.1 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/23?closed=1) on GitHub.

We updated the `@jupyter-widgets/controls` widget specification version to `1.1.0`, leading to the version bump to 7.1. The new widget model specification now includes new `description_width` and `font_weight` attributes for the `ToggleButtonsStyle` widget. There are also other bugfixes in this release.

7.0.x patch releases
--------------------

See the GitHub milestones for the [7.0.1](https://github.com/jupyter-widgets/ipywidgets/milestone/16?closed=1), [7.0.2](https://github.com/jupyter-widgets/ipywidgets/milestone/17?closed=1), [7.0.3](https://github.com/jupyter-widgets/ipywidgets/milestone/18?closed=1), [7.0.4](https://github.com/jupyter-widgets/ipywidgets/milestone/20?closed=1), and [7.0.5](https://github.com/jupyter-widgets/ipywidgets/milestone/21?closed=1) releases for bugfixes in these releases.

7.0
---

To see the full list of pull requests and issues, see the [7.0 milestone](https://github.com/jupyter-widgets/ipywidgets/milestone/12?closed=1) on GitHub.

Major user-visible changes in ipywidgets 7.0 include:

- Widgets are now displayed in the output area in the classic notebook and are treated as any other output. This allows the widgets to work more naturally with other cell output. To delete a widget, clear the output from the cell. Output from functions triggered by a widget view is appended to the output area that contains the widget view. This means that printed text will be appended to the output, and calling `clear_output()` will delete the entire output, including the widget view. ([#1274](https://github.com/jupyter-widgets/ipywidgets/pull/1274), [#1353](https://github.com/jupyter-widgets/ipywidgets/pull/1353))
- Removed the version validation check since it was causing too many false warnings about the widget javascript not being installed or the wrong version number. It is now up to the user to ensure that the ipywidgets and widgetsnbextension packages are compatible. ([#1219](https://github.com/jupyter-widgets/ipywidgets/pull/1219))
- The documentation theme is changed to the new standard Jupyter theme. ([#1363](https://github.com/jupyter-widgets/ipywidgets/pull/1363))
- The `layout` and `style` traits can be set with a dictionary for convenience, which will automatically converted to a Layout or Style object, like `IntSlider(layout={'width': '100%'}, style={'handle_color': 'lightgreen'})`. ([#1253](https://github.com/jupyter-widgets/ipywidgets/pull/1253))
- The Select widget now is a listbox instead of a dropdown, reverting back to the pre-6.0 behavior. ([#1238](https://github.com/jupyter-widgets/ipywidgets/pull/1238))
- The Select and SelectMultiple widgets now have a `rows` attribute for the number of rows to display, consistent with the Textarea widget. The `layout.height` attribute overrides this to control the height of the widget. ([#1250](https://github.com/jupyter-widgets/ipywidgets/pull/1250))
- Selection widgets (`Select`, `Dropdown`, `ToggleButtons`, etc.) have new `.value`, `.label`, and `.index` traits to make it easier to access or change the selected option.  ([#1262](https://github.com/jupyter-widgets/ipywidgets/pull/1262), [#1513](https://github.com/jupyter-widgets/ipywidgets/pull/1513))
- Selection container widgets (`Accordion`, `Tabs`) can have their `.selected_index` set to `None` to deselect all items. ([#1495](https://github.com/jupyter-widgets/ipywidgets/pull/1495))
- The `Play` widget range is now inclusive (max value is max, instead of max-1), to be consistent with Sliders
- The `Play` widget now has an optional repeat toggle button (visible by default). ([#1190](https://github.com/jupyter-widgets/ipywidgets/pull/1190))
- A refactoring of the text, slider, slider range, and progress widgets in resulted in the progress widgets losing their `step` attribute (which was previously ignored), and a number of these widgets changing their `_model_name` and/or `_view_name` attributes ([#1290](https://github.com/jupyter-widgets/ipywidgets/pull/1290))
- The `Checkbox` description is now on the right of the checkbox and is clickable. The `Checkbox` widget has a new `indent` attribute (defaults to `True`) to line up nicely with controls that have descriptions. To make the checkbox align to the left, set `indent` to `False`. ([#1346](https://github.com/jupyter-widgets/ipywidgets/pull/1346))
- A new Password widget, which behaves exactly like the Text widget, but hides the typed text: `Password()`. ([#1310](https://github.com/jupyter-widgets/ipywidgets/pull/1310))
- A new SelectionRangeSlider widget for selecting ranges from ordered lists of objects. For example, this enables having a slider to select a date range. ([#1356](https://github.com/jupyter-widgets/ipywidgets/pull/1356))
- The `Label` widget now has no width restriction. ([#1269](https://github.com/jupyter-widgets/ipywidgets/pull/1269))
- The description width is now configurable with the `.style.description_width` attribute ([#1376](https://github.com/jupyter-widgets/ipywidgets/pull/1376))
- ToggleButtons have a new `.style.button_width` attribute to set the CSS width of the buttons. Set this to `'initial'` to have buttons that individually size to the content width. ([#1257](https://github.com/jupyter-widgets/ipywidgets/pull/1257))
- The `readout_format` attribute of number sliders now validates its argument. ([#1550](https://github.com/jupyter-widgets/ipywidgets/pull/1550))
- The `IntRangeSlider` widget now has a `.readout_format` trait to control the formatting of the readout. ([#1446](https://github.com/jupyter-widgets/ipywidgets/pull/1446))
- The `Text`, `Textarea`, `IntText`, `BoundedIntText`, `FloatText`, and `BoundedFloatText` widgets all gained a `continuous_update` attribute (defaults to `True` for `Text` and `TextArea`, and `False` for the others).  ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `IntText`, `BoundedIntText`, `FloatText`, and `BoundedFloatText` widgets are now rendered as HTML number inputs, and have a `step` attribute that controls the resolution. ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `Text.on_submit` callback is deprecated; instead, set `continuous_update` to `False` and observe the `value` attribute: `mywidget.observe(callback, 'value')`. The `Textarea.scroll_to_bottom` method was removed. ([#1545](https://github.com/jupyter-widgets/ipywidgets/pull/1545))
- The `msg_throttle` attribute on widgets is now gone, and the code has a hardcoded message throttle equivalent to `msg_throttle=1`. ([#1557](https://github.com/jupyter-widgets/ipywidgets/pull/1557))
- Using function annotations to specify interact controls for a function is now deprecated and will be removed in a future version of ipywidgets. ([#1292](https://github.com/jupyter-widgets/ipywidgets/pull/1292))
- There are now two simple ways to embed widgets in an HTML page: with a simple script tag that does not use require.js and does not support anything but the basic widgets, and a require module that does support custom widgets. See the migration guide for more details. ([#1615](https://github.com/jupyter-widgets/ipywidgets/pull/1615), [#1629](https://github.com/jupyter-widgets/ipywidgets/pull/1629), [#1630](https://github.com/jupyter-widgets/ipywidgets/pull/1630))

If you are developing a custom widget or widget manager, here are some major changes that may affect you. The [migration guide](./migration_guides.md) also walks through how to upgrade a custom widget.

- On the Python/kernel side:
  - The Python `@register` decorator for widget classes no longer takes a string argument, but registers a widget class using the `_model_*` and `_view_*` traits in the class. Using the decorator as `@register('name')` is deprecated and should be changed to just `@register`. [#1228](https://github.com/jupyter-widgets/ipywidgets/pull/1228), [#1276](https://github.com/jupyter-widgets/ipywidgets/pull/1276)
  - Widgets will now need correct `_model_module` and `_view_module` Unicode traits defined.
  - Selection widgets now sync the index of the selected item, rather than the label. ([#1262](https://github.com/jupyter-widgets/ipywidgets/pull/1262))
  - The Python `ipywidget.domwidget.LabeledWidget` is now `ipywidget.widget_description.DescriptionWidget`, and there is a new `ipywidget.widget_description.DescriptionStyle` that lets the user set the CSS width of the description.
  - Custom serializers can now return a structure that contains binary objects (`memoryview`, `bytearray`, or Python 3 `bytes` object). In this case, the sync message will be a binary message, which is much more efficient for binary data than base64-encoding. The Image widget now uses this binary synchronization. ([#1194](https://github.com/jupyter-widgets/ipywidgets/pull/1194), [#1595](https://github.com/jupyter-widgets/ipywidgets/pull/1595), [#1643](https://github.com/jupyter-widgets/ipywidgets/pull/1643))
- On the Javascript side:
  - The `jupyter-js-widgets` Javascript package has been split into `@jupyter-widgets/base` package (containing base widget classes, the DOM widget, and the associated layout and style classes), and the `@jupyter-widgets/controls` package (containing the rest of the Jupyter widgets controls). Authors of custom widgets will need to update to depend on `@jupyter-widgets/base` instead of `jupyter-js-widgets` (if you use a class from the controls package, you will also need to depend on `@jupyter-widgets/controls`). See the [cookie cutter](https://github.com/jupyter-widgets/widget-cookiecutter) to generate a simple example custom widget using the new packages.
  - Custom serializers in Javascript are now synchronous, and should return a snapshot of the widget state. The default serializer makes a copy of JSONable objects. ([#1270](https://github.com/jupyter-widgets/ipywidgets/pull/1270))
  - Custom serializers can now return a structure that contains binary objects (`ArrayBuffer`, `DataView`, or a typed array such as `Int8Array`, `Float64Array`, etc.). In this case, the sync message will be a binary message, which is much more efficient for binary data than base64-encoding. The Image widget now uses this binary synchronization. ([#1194](https://github.com/jupyter-widgets/ipywidgets/pull/1194), [#1643](https://github.com/jupyter-widgets/ipywidgets/pull/1643))
  - A custom serializer is given the widget instance as its second argument, and a custom deserializer is given the widget manager as its second argument.
  - The Javascript model `.id` attribute has been renamed to `.model_id` to avoid conflicting with the Backbone `.id` attribute. ([#1410](https://github.com/jupyter-widgets/ipywidgets/pull/1410))
- Regarding widget managers and the syncing message protocol:
  - The widget protocol was significantly overhauled. The new widget messaging protocol (version 2) is specified in the [version 2 protocol documentation](https://github.com/jupyter-widgets/ipywidgets/blob/master/jupyter-widgets-schema/messages.md).
  - Widgets are now displayed with a `display_data` message instead of with a custom comm message. See the [ipywidgets](https://github.com/jupyter-widgets/ipywidgets/blob/20cd0f050090b1b19bb9657b8c3fa42ae384cfca/ipywidgets/widgets/widget.py#L656) implementation for an example. ([#1274](https://github.com/jupyter-widgets/ipywidgets/pull/1274))
  - Custom widget managers are now responsible completely for loading widget model and view classes. Widget managers should provide an output model and view class appropriate for their environment so that the `Output` widget works. ([#1313](https://github.com/jupyter-widgets/ipywidgets/pull/1313))
  - The widget manager `clear_state` method no longer has a `commlessOnly` argument. All models in the widget manager will be closed and cleared when `clear_state` is called. ([#1354](https://github.com/jupyter-widgets/ipywidgets/pull/1354))

6.0
---

Major user-visible changes in ipywidgets 6.0 include:

 - Rendering of Jupyter interactive widgets in various web contexts

     sphinx documentation: http://ipywidgets.readthedocs.io/en/latest/examples/Widget%20List.html
     nbviewer: http://nbviewer.jupyter.org/github/jupyter-widgets/ipywidgets/blob/master/docs/source/examples/Widget%20List.ipynb
     Static web pages: http://jupyter.org/widgets

 -  Addition of a DatePicker widget in the core widget collection.

 - Changes to the automatic control generation syntax in @interact, inspired by the Sage interact syntax.

 - Removal of APIs which had been deprecated in 5.0, including top-level styling in attributes of DOMWidgets and some corner cases in the behavior of `@interact`.

 - A new API for custom styling of widgets is provided, through a top-level `style` attribute. For example, the color of a slider handler can be set by `slider.style.handle_color`.

- Removal of the Proxy and PlaceProxy widgets.

- Removal of the deprecated `FlexBox` widget. Use the `Box`, `HBox`, or `VBox` widgets instead. Various flex properties can be set using the `layout` attribute.

- Removal of the deprecated `Latex` widget. Use the new `HTMLMath` widget with Latex math inside `$` or `$$` delimiters instead.

- Removal of the deprecated layout properties on a widget such as `.width`, `.height`, etc. Use the `layout` attribute with a `Layout` widget to manage various layout properties instead.

- The `Label` widget now has styling to make it consistent with labels on various widgets. To have freeform text with mathematics, use the new `HTMLMath` widget.

- Removal of the `button_style` attribute of the Dropdown widget

 - Addition of an OutputWidget for capturing output and rich display objects. @interact has changed to use an OutputWidget for function output instead of overwriting the output area of a cell.

 - The jupyter-js-widgets Javascript implementation now relies on the PhosphorJS framework for the management of rich layout and a better integration of JupyterLab.

- Numerous bug fixes.

*Note for custom widget authors:*

ipywidgets 6.0 breaks backward compatibility with respect to the handling of default values of the JavaScript side. Now, the default values for core widget models are specified with a `default()` method returning a dictionary instead of a `default` dictionary attribute. If you want your library to be backwards compatible with ipywidgets 5.x, you could use  [_.result](http://underscorejs.org/#result) like this:
```javascript
...
defaults: function() {
        return _.extend(_.result(this, 'widgets.DOMWidgetModel.prototype.defaults'), {
          ....
        })
},
...
```


This should not have an impact when using your custom widgets in the classic notebook, but will be really important when deploying your interactive widgets in web contexts.

5.x
---

4.1.x
-----

### 4.1.1

### 4.1.0

4.0.x
-----

### 4.0.3

Bump version with miscellaneous bug fixes.

### 4.0.2

Add README.rst documentation.

### 4.0.1

Remove ipynb checkpoints.

### 4.0.0

First release of **ipywidgets** as a standalone package.
