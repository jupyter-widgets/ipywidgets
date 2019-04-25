from .widget_description import DescriptionWidget
from .widget import Widget, CallbackDispatcher, register, widget_serialization
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from .widget_bool import _Bool
from .widget_media import Icon
from .trait_types import TypedTuple, InstanceString
from traitlets import Unicode, Instance, CBool

class Action(_Bool):
    _view_name = Unicode('MenuView').tag(sync=True)
    _model_name = Unicode('MenuModel').tag(sync=True)
    icon = InstanceString(Icon, Icon.fontawesome, default_value=None, allow_none=True, help= "Button icon.").tag(sync=True, **widget_serialization)
    checkable = CBool(None, allow_none=True, help="When True, will toggle the value property when clicked.").tag(sync=True)
    disabled = CBool(False, help="Enable or disable user changes.").tag(sync=True)
    command = Unicode(None, allow_none=True).tag(sync=True)

class Menu(Action):
    _view_name = Unicode('MenuView').tag(sync=True)
    _model_name = Unicode('MenuModel').tag(sync=True)
    items = TypedTuple(trait=Instance('ipywidgets.Action'), help="Menu items", default=None, allow_none=True).tag(sync=True, **widget_serialization).tag(sync=True)
    # icon = InstanceString(Icon, Icon.fontawesome, default_value=None, allow_none=True, help= "Button icon.").tag(sync=True, **widget_serialization)
    # checkable = CBool(None, allow_none=True, help="When True, will toggle the value property when clicked.").tag(sync=True)
    # disabled = CBool(False, help="Enable or disable user changes.").tag(sync=True)


    def __init__(self, **kwargs):
        super(Menu, self).__init__(**kwargs)
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

# this is needed to allow items to be None
Menu.items.default_args = None


class Application(DescriptionWidget):
    _view_name = Unicode('ApplicationView').tag(sync=True)
    _model_name = Unicode('ApplicationModel').tag(sync=True)
    menubar = Instance('ipywidgets.Menu', allow_none=True).tag(sync=True, **widget_serialization)
    toolbar = TypedTuple(trait=Instance('ipywidgets.DOMWidget'), help="List of widgets to be shown between the menu bar and central widget", default=None, allow_none=True).tag(sync=True, **widget_serialization).tag(sync=True)
    central_widget = Instance('ipywidgets.DOMWidget', help='The main widget shown in the center').tag(sync=True, **widget_serialization)
