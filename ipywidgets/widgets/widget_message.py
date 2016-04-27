"""
MessageWidget

Represents a widget that can be used to intercept display messages.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .domwidget import DOMWidget
from io import StringIO
from traitlets import (
    Unicode, List, Instance, default, observe
)
from IPython.display import clear_output
from IPython import get_ipython
from ipykernel.hookmanager import MessageHookFor
from ipykernel.zmqshell import ZMQDisplayPublisher

from .widget import register


@register('Jupyter.MessageWidget')
class MessageWidget(DOMWidget):
    """ Widget used as a context manager to display hooked messages.

    This widget can capture and display any 'display_data' messages.

    Example
    -------
    >>> import ipywidgets as widgets
    >>> from IPython.display import display
    >>> hooked = widgets.MessageWidget('display_data')
    >>> display(hooked)
    >>> print('prints to output area')
    >>> with hooked:
            display('displays in message widget')
    """
    _view_name = Unicode('MessageWidgetView').tag(sync=True)
    _model_name = Unicode('MessageWidgetModel').tag(sync=True)
    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    # Currently defaulting to `display_data`. To intercept other
    # messages, change this attribute name.
    _message_type = Unicode('display_data')

    # Hookable messages are only implemented on the ZMQDisplayPublisher
    #
    _pub = Instance(ZMQDisplayPublisher)

    # The list of messages stored by the hook when activated
    # (in context).
    #
    stored_messages = List().tag(sync=True)

    # The context manager for capturing the messages
    #
    capture = Instance(MessageHookFor)

    @default('_pub')
    def _pub_default(self):
        return get_ipython().display_pub

    def clear_output(self, *args, **kwargs):
        self.clear()

    def clear(self):
        """
        Clear the stored messages list.
        """
        self.stored_messages = []
        self.value = []

    def capture(self, message_type=None):
        msg_type = message_type or self._message_type
        return MessageHookFor(msg_type, parent=self)

    def store(self, item):
        """
        Store an item in the stored messages list.
        """
        temp = self.stored_messages[:]
        temp.append(item)
        self.stored_messages = temp
        self.value = temp
