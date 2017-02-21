# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Image class.

Represents an image in the frontend using a widget.
"""

import base64

from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .valuewidget import ValueWidget
from .widget import register
from traitlets import Unicode, CUnicode, Bytes, observe


@register('Jupyter.Image')
class Image(DOMWidget, ValueWidget, CoreWidget):
    """Displays an image as a widget.

    The `value` of this widget accepts a byte string.  The byte string is the
    raw image data that you want the browser to display.  You can explicitly
    define the format of the byte string using the `format` trait (which
    defaults to "png").
    """
    _view_name = Unicode('ImageView').tag(sync=True)
    _model_name = Unicode('ImageModel').tag(sync=True)
    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    # Define the custom state properties to sync with the front-end
    format = Unicode('png').tag(sync=True)
    width = CUnicode().tag(sync=True)
    height = CUnicode().tag(sync=True)
    _b64value = Unicode().tag(sync=True)

    value = Bytes()

    @observe('value')
    def _value_changed(self, change):
        self._b64value = base64.b64encode(change['new'])
