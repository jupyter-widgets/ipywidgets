# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Box class.

Represents a container that can be used to group other widgets.
"""

from .widget import register, widget_serialization
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from .widget_layout import Layout
from traitlets import Unicode, Tuple, Int, CaselessStrEnum, Instance, default
from warnings import warn


@register('Jupyter.Box')
class Box(DOMWidget, CoreWidget):
    """Displays multiple widgets in a group."""
    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _model_name = Unicode('BoxModel').tag(sync=True)
    _view_name = Unicode('BoxView').tag(sync=True)

    # Child widgets in the container.
    # Using a tuple here to force reassignment to update the list.
    # When a proper notifying-list trait exists, that is what should be used here.
    children = Tuple().tag(sync=True, **widget_serialization)

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
