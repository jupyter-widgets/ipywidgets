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


class _SelectionContainer(Box, CoreWidget):
    """Base class used to display multiple child widgets."""
    _titles = Dict(help="Titles of the pages").tag(sync=True)
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
        # JSON dictionaries have string keys, so we convert index to a string
        index = str(int(index))
        self._titles[index] = title
        self.send_state('_titles')

    def get_title(self, index):
        """Gets the title of a container pages.

        Parameters
        ----------
        index : int
            Index of the container page
        """
        # JSON dictionaries have string keys, so we convert index to a string
        index = str(int(index))
        if index in self._titles:
            return self._titles[index]
        else:
            return None

    def _repr_keys(self):
        # We also need to include _titles in repr for reproducibility
        yield from super()._repr_keys()
        if self._titles:
            yield '_titles'


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
        if len(change.new) > 0:
            self.selected_index = 0

@register
class Stacked(_SelectionContainer):
    """Displays only the selected child."""
    _view_name = Unicode('StackedView').tag(sync=True)
    _model_name = Unicode('StackedModel').tag(sync=True)
