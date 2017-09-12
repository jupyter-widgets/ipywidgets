from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .valuewidget import ValueWidget
from .trait_types import InstanceDict
from .widget import register, widget_serialization, CallbackDispatcher
from traitlets import Unicode, CUnicode, Bytes, observe, Int


@register
class MouseListener(CoreWidget):
    _model_name = Unicode('MouseListenerModel').tag(sync=True)
    source = InstanceDict(DOMWidget).tag(sync=True, **widget_serialization)

    def __init__(self, **kwargs):
        super(MouseListener, self).__init__(**kwargs)
        self._click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_mouse_msg)

    def on_click(self, callback, remove=False):
        """Register a callback to execute when the button is clicked.

        The callback will be called with one argument, the clicked button
        widget instance.

        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._click_handlers.register_callback(callback, remove=remove)

    def _handle_mouse_msg(self, foo, content, buffers):
        raise RuntimeError
        print('foo: ', foo)
        print('content: ', content)
        print('buffers: ', buffers)
        if content.get('event', '') == 'click':
            self._click_handlers(self)
