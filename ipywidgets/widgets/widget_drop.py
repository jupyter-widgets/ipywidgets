# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the DropWidget class"""
from .widget import Widget, CallbackDispatcher, widget_serialization
from traitlets import Bool, Dict


class DropWidget(Widget):
    """Widget that has the ondrop handler. Used as a mixin"""

    draggable = Bool(default=False).tag(sync=True)
    drag_data = Dict().tag(sync=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._drop_handlers = CallbackDispatcher()
        self._dragstart_handlers = CallbackDispatcher()
        self.on_msg(self._handle_dragdrop_msg)

    def on_drop(self, callback, remove=False):
        """Register a callback to execute when an element is dropped.

        The callback will be called with two arguments, the clicked button
        widget instance, and the dropped element data.

        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._drop_handlers.register_callback(callback, remove=remove)

    def drop(self, data):
        """Programmatically trigger a drop event.

        This will call the callbacks registered to the  drop event.
        """

        if data.get('application/x-widget'):
            widget = widget_serialization['from_json']('IPY_MODEL_' + data['application/x-widget'])        
            data['widget'] = widget
        self._drop_handlers(self, data)

    def on_dragstart(self, callback, remove=False):
        self._dragstart_handlers.register_callback(callback, remove=remove)

    def dragstart(self):
        self._dragstart_handlers(self)

    def _handle_dragdrop_msg(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'drop':
            self.drop(content.get('data', {}))
        elif content.get('event', '') == 'dragstart':
            self.dragstart()
