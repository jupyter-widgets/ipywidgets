# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""SelectionContainer class.

Represents a multipage container that can be used to group other widgets into
pages.
"""

from .widget_box import Box
from .widget import register
from .widget_core import CoreWidget
from traitlets import Unicode, Dict, CInt, TraitError, validate
from .trait_types import TypedTuple


class _SelectionContainer(Box, CoreWidget):
    """Base class used to display multiple child widgets."""
    titles = TypedTuple(trait=Unicode(), help="Titles of the pages").tag(sync=True)
    selected_index = CInt(
        help="""The index of the selected page. This is either an integer selecting a particular sub-widget, or None to have no widgets selected.""",
        allow_none=True
    ).tag(sync=True)

    @validate('selected_index')
    def _validated_index(self, proposal):
        if proposal.value is None or 0 <= proposal.value < len(self.children):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    # Public methods
    def set_title(self, index, title):
        """Sets the title of a container page.

        Parameters
        ----------
        index : int
            Index of the container page
        title : unicode
            New title
        """
        titles = list(self.titles)
        titles[index] = title
        self.titles = titles

    def get_title(self, index):
        """Gets the title of a container page.

        Parameters
        ----------
        index : int
            Index of the container page
        """
        if 0<=index<len(self.titles):
            return self.titles[index]
        else:
            return None

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


@register
class Stacked(_SelectionContainer):
    """Displays only the selected child."""
    _view_name = Unicode('StackedView').tag(sync=True)
    _model_name = Unicode('StackedModel').tag(sync=True)
