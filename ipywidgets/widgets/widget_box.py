"""Box class.

Represents a container that can be used to group other widgets.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import register, widget_serialization
from .domwidget import DOMWidget
from .widget_layout import Layout
from traitlets import Unicode, Tuple, Int, CaselessStrEnum, Instance, default
from warnings import warn


@register('Jupyter.Box')
class Box(DOMWidget):
    """Displays multiple widgets in a group."""
    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _model_name = Unicode('BoxModel').tag(sync=True)
    _view_name = Unicode('BoxView').tag(sync=True)

    # Child widgets in the container.
    # Using a tuple here to force reassignment to update the list.
    # When a proper notifying-list trait exists, that is what should be used here.
    children = Tuple().tag(sync=True, **widget_serialization)

    _overflow_values = ['visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit', '']
    overflow_x = CaselessStrEnum(
        values=_overflow_values,
        default_value='', help="""Specifies what happens to content that is too
        large for the rendered region.""").tag(sync=True)
    overflow_y = CaselessStrEnum(
        values=_overflow_values,
        default_value='', help="""Specifies what happens to content that is too
        large for the rendered region.""").tag(sync=True)

    box_style = CaselessStrEnum(
        values=['success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the box.""").tag(sync=True)

    def __init__(self, children = (), **kwargs):
        kwargs['children'] = children
        super(Box, self).__init__(**kwargs)
        self.on_displayed(Box._fire_children_displayed)

    def _fire_children_displayed(self):
        for child in self.children:
            child._handle_displayed()


@register('Jupyter.VBox')
class VBox(Box):
    """Displays multiple widgets vertically using the flexible box model."""
    _model_name = Unicode('VBoxModel').tag(sync=True)
    _view_name = Unicode('VBoxView').tag(sync=True)


@register('Jupyter.HBox')
class HBox(Box):
    """Displays multiple widgets horizontally using the flexible box model."""
    _model_name = Unicode('HBoxModel').tag(sync=True)
    _view_name = Unicode('HBoxView').tag(sync=True)


@register('Jupyter.Proxy')
class Proxy(DOMWidget):
    """A DOMWidget that holds another DOMWidget or nothing."""
    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _model_name = Unicode('ProxyModel').tag(sync=True)
    _view_name = Unicode('ProxyView').tag(sync=True)

    # Child widget of the Proxy
    child = Instance(DOMWidget, allow_none=True).tag(sync=True, **widget_serialization)

    def __init__(self, child, **kwargs):
        kwargs['child'] = child
        super(Proxy, self).__init__(**kwargs)
        self.on_displayed(Proxy._fire_child_displayed)

    def _fire_child_displayed(self):
        if self.child is not None:
            self.child._handle_displayed()


@register('Jupyter.PlaceProxy')
class PlaceProxy(Proxy):
    """Renders the child widget at the specified selector."""
    _view_name = Unicode('PlaceProxyView').tag(sync=True)
    _model_name = Unicode('PlaceProxyModel').tag(sync=True)
    selector = Unicode().tag(sync=True)

