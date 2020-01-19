# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the DropWidget class"""
from .widget import Widget, CallbackDispatcher, register, widget_serialization
from .domwidget import DOMWidget
from .widget_core import CoreWidget
import json
from traitlets import Bool, Dict, Unicode, Instance


class DropWidget(DOMWidget, CoreWidget):
    """Base widget for the single-child DropBox and DraggableBox widgets"""

    draggable = Bool(default=False).tag(sync=True)
    drag_data = Dict().tag(sync=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._drop_handlers = CallbackDispatcher()
        self.on_msg(self._handle_dragdrop_msg)

    def on_drop(self, callback, remove=False):
        """ Register a callback to execute when an element is dropped.

        The callback will be called with two arguments, the clicked button
        widget instance, and the dropped element data.

        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._drop_handlers.register_callback(callback, remove=remove)

    def drop(self, data):
        """ Programmatically trigger a drop event.
        This will call the callbacks registered to the  drop event.
        """

        if data.get('application/vnd.jupyter.widget-view+json'):
            widget_mime = json.loads(data['application/vnd.jupyter.widget-view+json'])
            data['widget'] = widget_serialization['from_json']('IPY_MODEL_' + widget_mime['model_id'])

        self._drop_handlers(self, data)

    def _handle_dragdrop_msg(self, _, content, buffers):
        """ Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'drop':
            self.drop(content.get('data', {}))

@register
class DropBox(DropWidget):
    """ A box that receives a drop event

    The DropBox can have one child, and you can attach an `on_drop` handler to it.

    Parameters
    ----------
    child: Widget instance
    The child widget instance that is displayed inside the DropBox

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> dropbox_widget = widgets.DropBox(Label("Drop something on top of me"))
    >>> dropbox_widget.on_drop(lambda box, data: print(data))
    """

    _model_name = Unicode('DropBoxModel').tag(sync=True)
    _view_name = Unicode('DropBoxView').tag(sync=True)
    child = Instance(Widget, allow_none=True).tag(sync=True, **widget_serialization)

    def __init__(self, child=None, **kwargs):
        super(DropBox, self).__init__(**kwargs, child=child)

@register
class DraggableBox(DropWidget):
    """ A draggable box

    A box widget that can be dragged e.g. on top of a DropBox. The draggable box can
    contain a single child, and optionally drag_data which will be received on the widget
    it's dropped on.
    Draggability can be modified by flipping the boolean ``draggable`` attribute.

    Parameters
    ----------
    child: Widget instance
    The child widget instance that is displayed inside the DropBox

    draggable: Boolean (default True)
    Trait that flips wether the draggable box is draggable or not

    drag_data: Dictionary
    You can attach custom drag data here, which will be received as an argument on the receiver
    side (in the ``on_drop`` event).

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> draggable_widget = widgets.DraggableBox(Label("You can drag this button"))
    >>> draggable_widget.drag_data = {"somerandomkey": "I have this data for you ..."}
    """

    _model_name = Unicode('DraggableBoxModel').tag(sync=True)
    _view_name = Unicode('DraggableBoxView').tag(sync=True) 
    child = Instance(Widget, allow_none=True).tag(sync=True, **widget_serialization)
    draggable = Bool(True).tag(sync=True)
    drag_data = Dict().tag(sync=True)

    def __init__(self, child=None, **kwargs):
        super(DraggableBox, self).__init__(**kwargs, child=child)
