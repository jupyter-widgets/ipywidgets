from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .valuewidget import ValueWidget
from .trait_types import InstanceDict
from .widget import register, widget_serialization
from traitlets import Unicode, CUnicode, Bytes, observe, Int


@register
class MouseListener(CoreWidget):
    _model_name = Unicode('MouseListenerModel').tag(sync=True)
    target = InstanceDict(DOMWidget).tag(sync=True, **widget_serialization)
