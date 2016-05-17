"""Box class.

Represents a container that can be used to group other widgets.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .domwidget import DOMWidget
from .widget import Widget, register, widget_serialization
from traitlets import Unicode, Tuple, Int, CaselessStrEnum, Instance
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


def VBox(*pargs, **kwargs):
    """Displays multiple widgets vertically using the flexible box model."""
    box = Box(*pargs, **kwargs)
    box.layout.display = 'flex'
    box.layout.flex_flow = 'column'
    box.layout.align_items = 'stretch'
    return box


def HBox(*pargs, **kwargs):
    """Displays multiple widgets horizontally using the flexible box model."""
    box = Box(*pargs, **kwargs)
    box.layout.display = 'flex'
    box.layout.align_items = 'stretch'
    return box


@register('Jupyter.FlexBox')
class FlexBox(Box): # TODO: Deprecated in 5.0 (entire class)
    """Displays multiple widgets using the flexible box model."""
    _view_name = Unicode('FlexBoxView').tag(sync=True)
    _model_name = Unicode('FlexBoxModel').tag(sync=True)
    orientation = CaselessStrEnum(values=['vertical', 'horizontal'], default_value='vertical').tag(sync=True)
    flex = Int(help="""Specify the flexible-ness of the model.""").tag(sync=True)
    def _flex_changed(self, name, old, new):
        new = min(max(0, new), 2)
        if self.flex != new:
            self.flex = new

    _locations = ['start', 'center', 'end', 'baseline', 'stretch']
    pack = CaselessStrEnum(values=_locations, default_value='start').tag(sync=True)
    align = CaselessStrEnum(values=_locations, default_value='start').tag( sync=True)

    def __init__(self, *pargs, **kwargs):
        warn('FlexBox is deprecated in ipywidgets 5.0.  Use Box and Box.layout instead.', DeprecationWarning)
        super(FlexBox, self).__init__(*pargs, **kwargs)
