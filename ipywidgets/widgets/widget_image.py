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


@register
class Image(DOMWidget, ValueWidget, CoreWidget):
    """Displays an image as a widget.

    The `value` of this widget accepts a byte string.  The byte string is the
    raw image data that you want the browser to display.  You can explicitly
    define the format of the byte string using the `format` trait (which
    defaults to "png").
    """
    _view_name = Unicode('ImageView').tag(sync=True)
    _model_name = Unicode('ImageModel').tag(sync=True)

    # Define the custom state properties to sync with the front-end
    format = Unicode('png', help="The format of the image.").tag(sync=True)
    width = CUnicode(help="Width of the image in pixels.").tag(sync=True)
    height = CUnicode(help="Height of the image in pixels.").tag(sync=True)
    value = Bytes(help="The image data as a byte string.").tag(sync=True)
