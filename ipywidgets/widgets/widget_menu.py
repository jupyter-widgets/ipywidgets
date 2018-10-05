from .widget_description import DescriptionWidget
from .widget import Widget, CallbackDispatcher, register, widget_serialization
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from .trait_types import TypedTuple
from traitlets import (Unicode, Instance)

@register
class MenuItem(DescriptionWidget):
    _view_name = Unicode('MenuItemView').tag(sync=True)
    # _model_name = Unicode('MenuItemModel').tag(sync=True)
    # submenu = Instance('ipywidgets.Menu').tag(sync=True)

    def __init__(self, **kwargs):
        super(MenuItem, self).__init__(**kwargs)
        self._click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_button_msg)

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

    def click(self):
        """Programmatically trigger a click event.

        This will call the callbacks registered to the clicked button
        widget instance.
        """
        self._click_handlers(self)

    def _handle_button_msg(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'click':
            self.click()

class Menu(DOMWidget, CoreWidget):
    _view_name = Unicode('MenuView').tag(sync=True)
    _model_name = Unicode('MenuModel').tag(sync=True)
    items = TypedTuple(trait=Instance(MenuItem), help="Menu items").tag(sync=True, **widget_serialization).tag(sync=True)