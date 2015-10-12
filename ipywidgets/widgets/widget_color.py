"""Color class.

Represents an HTML Color .
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import DOMWidget, register
from .trait_types import Color
from traitlets import Unicode


@register('IPython.ColorPicker')
class ColorPicker(DOMWidget):
    value = Color('black', sync=True)
    description = Unicode(sync=True)
    
    _view_name = Unicode('ColorPicker', sync=True)
