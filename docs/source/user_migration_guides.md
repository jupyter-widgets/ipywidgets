# Migrating user code

These are migration guides specifically for ipywidgets users.

## Migrating from 7.x to 8.0

For more details about the changes done for the 8.0 major version, please consult the
[changelog](./changelog).

### Code

#### FileUpload

The `data` and `metadata` traits have been removed, and the `value` trait revamped to
be a list of dicts containing the file information. The keys of these dicts are:

- `content`: The buffer of file data
- `name`: The name of the file
- `type`: The MIME type of the file content
- `size`: The size of the buffer in bytes
- `last_modified`: A UTC datetime representing the "last modified" value reported for the file

Suggested migration: Rewrite all usage of `FileUpload` to use the new structure.
If you need to support both 7.x and 8.x, you can e.g. write functions `get_file_buffer` and similar
to wrap reads from the widget:

- For the `.value` attribute, to retrieve it in the original form, use `{f["name"]: f.content.tobytes() for f in uploader.value}`.
- For the `.data` attribute, use `[f.content.tobytes() for f in uploader.value]`.
- For the `.metadata` attribute, use `[{k: v for k, v in f.items() if k != "content"} for f in w.value]`.

#### Tooltips

As part of an effort to make it possible to
[set tooltips for all widgets](https://github.com/jupyter-widgets/ipywidgets/pull/2680),
the old `description_tooltip` attribute for certain widgets was deprecated. Now all widgets
that inherit `DOMWidget` have the attribute `tooltip` instead.

Suggested migration: Search and replace `description_tooltip` to `tooltip` when you no longer
need to support ipywidgets 7.

#### Description Sanitization

The value of the `description` field of any widget that inherits `DescriptionWidget`
(most widgets in ipywidgets) will now have its value sanitized for certain HTML content
on the client side. If you are relying on HTML in this value, you might need to explicitly
set the `description_allow_html` trait to `True`, depending on what kind of tags/attributes
are used.

Suggested migration: Only set `description_allow_html` if you are in full control of the
value that is set.

#### Layout.border

While this change is strictly speaking backwards compatible, a word of caution is useful to
those that want to use the new functionality:

Four attributes have been added: `border_left`, `border_right`, `border_top` and `border_bottom`.
These can be used to set the corresponding CSS border strings individually. Setting the
`border` property overrides all of those four attributes to the new value of `border`. If
the individual values are set to different values, _the `border` property will return `None`
when you read its value_.

#### Layout.overflow_x / overflow_y

The previously deprecated traits `overflow_x` and `overflow_y`
[have been removed](https://github.com/jupyter-widgets/ipywidgets/pull/2688). Please
use the `overflow` trait instead.

#### `Widget.widgets` and `Widget.widget_types` attributes

The `Widget` class attributes `.widgets` and `.widget_types` are now deprecated and relocated to internal module-level private variables, opening up these attribute names on the `Widget` class for future uses.

### Deployments

#### Embedded CDN

Please note that the default CDN of ipywidgets has changed from unpkg to jsDelivr. If
you rely on the CDN being unpkg, this can be overridden by specifying the data
attribute `data-jupyter-widgets-cdn` on the HTML manager script tag. See
[embedding](./embedding) for details.

#### widgetsnbextension

The `notebook` package is no longer a dependency of the `widgetsnbextension`
package (therefore `notebook` is no longer a dependency of `ipywidgets`). If you
need to install `notebook` with `ipywidgets`, you will need to install
`notebook` explicitly.
