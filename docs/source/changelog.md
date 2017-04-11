ipywidgets changelog
====================

A summary of changes in ipywidgets. For more detailed information, see [GitHub](https://github.com/jupyter-widgets/ipywidgets).


7.0
---
Major user-visible changes in ipywidgets 7.0 include:

- The `Label` widget is now right-aligned and has no width restriction: [#1269](https://github.com/jupyter-widgets/ipywidgets/pull/1269)


Major changes developers should be aware of include:

- The python `@register` decorator for widget classes no longer takes a string argument, but registers a widget class using the `_model_*` and `_view_*` traits in the class. Using the decorator as `@register('name')` is deprecated and should be changed to just `@register`. [#1228](https://github.com/jupyter-widgets/ipywidgets/pull/1228), [#1276](https://github.com/jupyter-widgets/ipywidgets/pull/1276)

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
