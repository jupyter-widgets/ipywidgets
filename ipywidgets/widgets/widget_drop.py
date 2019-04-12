# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the DropWidget class"""
from .widget import Widget
from .widget import CallbackDispatcher

class DropWidget(Widget):
    """Widget that has the ondrop handler. Used as a mixin"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_drop_msg)

    def on_drop(self, callback, remove=False):
        """Register a callback to execute when an element is dropped.

        The callback will be called with two arguments, the clicked button
        widget instance, and the dropped element data.

        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._click_handlers.register_callback(callback, remove=remove)

    def drop(self, data):
        """Programmatically trigger a drop event.

        This will call the callbacks registered to the  drop event.
        """

        self._click_handlers(self, data)

    def _handle_drop_msg(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'drop':
            self.drop(content.get('data', {}))
