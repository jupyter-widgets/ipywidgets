# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the DOMWidget class"""

from traitlets import Unicode, Tuple
from .widget import Widget, widget_serialization
from .trait_types import InstanceDict
from .widget_layout import Layout
from .widget_style import Style


class DOMWidget(Widget):
    """Widget that can be inserted into the DOM"""

    _model_name = Unicode('DOMWidgetModel').tag(sync=True)
    _dom_classes = Tuple(help="CSS classes applied to widget DOM element").tag(sync=True)
    layout = InstanceDict(Layout).tag(sync=True, **widget_serialization)

    def add_class(self, className):
        """
        Adds a class to the top level element of the widget.

        Doesn't add the class if it already exists.
        """
        if className not in self._dom_classes:
            self._dom_classes = list(self._dom_classes) + [className]
        return self

    def remove_class(self, className):
        """
        Removes a class from the top level element of the widget.

        Doesn't remove the class if it doesn't exist.
        """
        if className in self._dom_classes:
            self._dom_classes = [c for c in self._dom_classes if c != className]
        return self


class DescriptionStyle(Style, Widget):
    """Description style widget."""
    _model_name = Unicode('DescriptionStyleModel').tag(sync=True)
    description_width = Unicode(help="Width of the description to the side of the control.").tag(sync=True)


class DescriptionWidget(DOMWidget):
    """Widget that has a description label to the side."""
    _model_name = Unicode('DescriptionModel').tag(sync=True)
    description = Unicode('', help="Description of the control.").tag(sync=True)
    style = InstanceDict(DescriptionStyle, help="Styling customizations").tag(sync=True, **widget_serialization)

# For backwards compatibility to ipywidgets 6.0
LabeledWidget = DescriptionWidget
