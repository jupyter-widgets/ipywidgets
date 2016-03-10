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
    value = Color('black').tag(sync=True)
    concise = Bool().tag(sync=True)
    description = Unicode().tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('ColorPickerView').tag(sync=True)
    _model_name = Unicode('ColorPickerModel').tag(sync=True)
