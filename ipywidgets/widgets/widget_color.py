# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Color class.

Represents an HTML Color .
"""

from .domwidget import LabeledWidget
from .valuewidget import ValueWidget
from .widget import register
from .widget_core import CoreWidget
from .trait_types import Color
from traitlets import Unicode, Bool


@register('Jupyter.ColorPicker')
class ColorPicker(LabeledWidget, ValueWidget, CoreWidget):
    value = Color('black').tag(sync=True)
    concise = Bool().tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('ColorPickerView').tag(sync=True)
    _model_name = Unicode('ColorPickerModel').tag(sync=True)
