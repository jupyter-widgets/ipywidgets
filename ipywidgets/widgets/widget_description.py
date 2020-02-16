# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the DOMWidget class"""

from traitlets import Bool, Unicode, observe
from .widget import Widget, widget_serialization, register
from .trait_types import InstanceDict
from .widget_style import Style
from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .util import sanitize

@register
class DescriptionStyle(Style, CoreWidget, Widget):
    """Description style widget."""
    _model_name = Unicode('DescriptionStyleModel').tag(sync=True)
    description_width = Unicode(help="Width of the description to the side of the control.").tag(sync=True)


class DescriptionWidget(DOMWidget, CoreWidget):
    """Widget that has a description label to the side."""
    _model_name = Unicode('DescriptionModel').tag(sync=True)
    description = Unicode('', help="Description of the control.").tag(sync=True)
    description_html = Bool(False, help="Accept HTML in the description.").tag(sync=True)
    style = InstanceDict(DescriptionStyle, help="Styling customizations").tag(sync=True, **widget_serialization)

    @observe('description', 'description_html')
    def description_changed(self, change):
        if change.name == 'description' and not self.description_html:
            return
        if change.name == 'description_html' and not change.new:
            return
        if change.name == 'description':
            self.description = sanitize(change.new)
        else:
            self.description = sanitize(self.description)

    def _repr_keys(self):
        for key in super()._repr_keys():
            # Exclude style if it had the default value
            if key == 'style':
                value = getattr(self, key)
                if repr(value) == '%s()' % value.__class__.__name__:
                    continue
            yield key
