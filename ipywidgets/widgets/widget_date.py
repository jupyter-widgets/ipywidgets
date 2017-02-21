# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Color class.

Represents an HTML Color .
"""

from .domwidget import LabeledWidget
from .valuewidget import ValueWidget
from .widget import register
from .widget_core import CoreWidget
from .trait_types import Datetime, datetime_serialization
from traitlets import Unicode


@register('Jupyter.DatePicker')
class DatePicker(LabeledWidget, ValueWidget, CoreWidget):
    value = Datetime(None, allow_none=True).tag(sync=True, **datetime_serialization)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('DatePickerView').tag(sync=True)
    _model_name = Unicode('DatePickerModel').tag(sync=True)
