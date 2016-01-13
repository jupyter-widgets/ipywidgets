"""Color class.

Represents an HTML Color .
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .domwidget import DOMWidget
from .widget import register
from .trait_types import Color
from traitlets import Unicode, Bool


@register('Jupyter.ColorPicker')
class ColorPicker(DOMWidget):
    value = Color('black', sync=True)
    concise = Bool(sync=True)
    description = Unicode(sync=True)

    _view_name = Unicode('ColorPickerView', sync=True)
    _model_name = Unicode('ColorPickerModel', sync=True)
