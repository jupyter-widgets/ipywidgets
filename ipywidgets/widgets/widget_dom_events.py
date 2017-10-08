from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .trait_types import InstanceDict
from .widget import register, widget_serialization, CallbackDispatcher
from traitlets import Unicode, List, Bool, validate


@register
class DOMListener(CoreWidget):
    _model_name = Unicode('DOMListenerModel').tag(sync=True)
    source = InstanceDict(DOMWidget).tag(sync=True, **widget_serialization)
    watched_events = List().tag(sync=True)
    ignore_modifier_key_events = Bool(False).tag(sync=True)
    prevent_default_action = Bool(False).tag(sync=True)
    _supported_mouse_events = List([
        'click',
        'auxclick',
        'dblclick',
        'mouseenter',
        'mouseleave',
        'mousedown',
        'mouseup',
        'mousemove',
        'wheel'
    ]).tag(sync=True)
    _supported_key_events = List([
        'keydown',
        'keyup'
    ]).tag(sync=True)

    def __init__(self, **kwargs):
        super(DOMListener, self).__init__(**kwargs)
        self._dom_handlers = CallbackDispatcher()
        self.on_msg(self._handle_mouse_msg)

    @property
    def supported_key_events(self):
        return self._supported_key_events

    @property
    def supported_mouse_events(self):
        return self._supported_mouse_events

    @validate('watched_events')
    def _validate_watched_events(self, proposal):
        value = proposal['value']
        bad_events = [v for v in value if v not in
                      self._supported_mouse_events
                      + self._supported_key_events]
        if bad_events:
            raise ValueError('The event(s) {} are not '
                             'supported.'.format(bad_events))
        return value

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

    def _handle_mouse_msg(self, _, content, buffers):
        self._dom_handlers(content)
