# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""SelectionContainer class.

Represents a multipage container that can be used to group other widgets into
pages.
"""

from .widget_box import Box
from .widget import register
from .widget_core import CoreWidget
from traitlets import Unicode, Dict, CInt, TraitError, validate, observe
from .trait_types import TypedTuple

class _SelectionContainer(Box, CoreWidget):
    """Base class used to display multiple child widgets."""
    titles = TypedTuple(trait=Unicode(), help="Titles of the pages").tag(sync=True)
    selected_index = CInt(
        help="""The index of the selected page. This is either an integer selecting a particular sub-widget, or None to have no widgets selected.""",
        allow_none=True,
        default_value=None
    ).tag(sync=True)

    @validate('selected_index')
    def _validated_index(self, proposal):
        if proposal.value is None or 0 <= proposal.value < len(self.children):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    @observe('children')
    def _observe_children(self, change):
        if self.selected_index is not None and len(change.new) < self.selected_index:
            self.selected_index = None

@register
class Accordion(_SelectionContainer):
    """Displays children each on a separate accordion page."""
    _view_name = Unicode('AccordionView').tag(sync=True)
    _model_name = Unicode('AccordionModel').tag(sync=True)


@register
class Tab(_SelectionContainer):
    """Displays children each on a separate accordion tab."""
    _view_name = Unicode('TabView').tag(sync=True)
    _model_name = Unicode('TabModel').tag(sync=True)

    def __init__(self, **kwargs):
        if 'children' in kwargs and 'selected_index' not in kwargs and len(kwargs['children']) > 0:
            kwargs['selected_index'] = 0
        super(Tab, self).__init__(**kwargs)

    @observe('children')
    def _observe_children(self, change):
        # if there are no tabs, then none should be selected
        if len(change.new) == 0:
            self.selected_index = None

        # if there are tabs, but none is selected, select the first one
        elif self.selected_index == None:
            self.selected_index = 0

        # if there are tabs and a selection, but the selection is no longer
        # valid, select the last tab.
        elif len(change.new) < self.selected_index:
            self.selected_index = len(change.new) - 1


@register
class Stacked(_SelectionContainer):
    """Displays only the selected child."""
    _view_name = Unicode('StackedView').tag(sync=True)
    _model_name = Unicode('StackedModel').tag(sync=True)
