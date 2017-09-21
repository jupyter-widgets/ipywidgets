from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .trait_types import InstanceDict
from .widget import register, widget_serialization, CallbackDispatcher
from traitlets import Unicode, List


@register
class MouseListener(CoreWidget):
    _model_name = Unicode('MouseListenerModel').tag(sync=True)
    source = InstanceDict(DOMWidget).tag(sync=True, **widget_serialization)
    watched_events = List().tag(sync=True)

    def __init__(self, **kwargs):
        super(MouseListener, self).__init__(**kwargs)
        self._dom_handlers = CallbackDispatcher()
        self.on_msg(self._handle_mouse_msg)

    def on_dom_event(self, callback, remove=False):
        """Register a callback to execute when a DOM event occurs.

        The callback will be called with one argument, an dict whose keys
        depend on the type of event.

        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._dom_handlers.register_callback(callback, remove=remove)

    def _handle_mouse_msg(self, foo, content, buffers):
        self._dom_handlers(content)
