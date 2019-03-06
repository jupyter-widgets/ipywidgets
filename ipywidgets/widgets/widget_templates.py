"""Implement common widgets layouts as reusable components"""

from traitlets import Instance, Bool, Unicode, CaselessStrEnum
from traitlets import observe

from .widget import Widget
from .widget_layout import CSS_PROPERTIES
from .widget_box import GridBox

class LayoutTemplate(GridBox):
    """Base class for layout templates

    This class handles mainly style attributes (height, grid_gap etc.)
    """

    # style attributes (passed to Layout)
    grid_gap = Unicode(None, allow_none=True,
                       help="The grid-gap CSS attribute.").tag(style=True)
    justify_content = CaselessStrEnum(
        ['flex-start', 'flex-end', 'center',
         'space-between', 'space-around'],
        allow_none=True,
        help="The justify-content CSS attribute.").tag(style=True)
    align_items = CaselessStrEnum(
        ['flex-start', 'flex-end', 'center',
         'baseline', 'stretch'],
        allow_none=True, help="The align-items CSS attribute.").tag(style=True)
    width = Unicode(None,
        allow_none=True,
        help="The width CSS attribute.").tag(style=True)
    height = Unicode(None,
        allow_none=True,
        help="The width CSS attribute.").tag(style=True)

    # extra args
    merge = Bool(default_value=True)

    def __init__(self, **kwargs):
        super(LayoutTemplate, self).__init__(**kwargs)
        self._copy_layout_props()


    def _copy_layout_props(self):

        _props = self.trait_names(style=True)

        for prop in _props:
            value = getattr(self, prop)
            if value:
                setattr(self.layout, prop, value)



class TwoByTwoLayout(LayoutTemplate):
    """ Define a layout with 2x2 regular grid.

    Parameters
    ----------

    top_left: instance of Widget
    top_right: instance of Widget
    bottom_left: instance of Widget
    bottom_right: instance of Widget
        widgets to fill the positions in the layout

    merge: bool
        flag to say whether the empty positions should be automatically merged

    grid_gap : str
        CSS attribute used to set the gap between the grid cells

    justify_content : str, in ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
        CSS attribute used to align widgets vertically

    align_items : str, in ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
        CSS attribute used to align widgets horizontally

    Examples
    --------

    >>> from ipywidgets import TwoByTwoLayout, Button
    >>> TwoByTwoLayout(top_left=Button(description="Top left"),
    ...                top_right=Button(description="Top right"),
    ...                bottom_left=Button(description="Bottom left"),
    ...                bottom_right=Button(description="Bottom right"))

    """

    # widget positions
    top_left = Instance(Widget, allow_none=True)
    top_right = Instance(Widget, allow_none=True)
    bottom_left = Instance(Widget, allow_none=True)
    bottom_right = Instance(Widget, allow_none=True)


    def __init__(self, **kwargs):
        super(TwoByTwoLayout, self).__init__(**kwargs)

        self._update_layout()

    def _update_layout(self):


        grid_template_areas = [["top-left", "top-right"],
                               ["bottom-left", "bottom-right"]]

        all_children = {'top-left' : self.top_left,
                        'top-right' : self.top_right,
                        'bottom-left' : self.bottom_left,
                        'bottom-right' : self.bottom_right}

        children = {position : child
                    for position, child in all_children.items()
                    if child is not None}

        if not children:
            return

        for position, child in children.items():
            child.layout.grid_area = position

        if self.merge:

            if len(children) == 1:
                position = list(children.keys())[0]
                grid_template_areas = [[position, position],
                                       [position, position]]
            else:
                columns = ['left', 'right']
                for i, column in enumerate(columns):
                    top, bottom = children.get('top-' + column), children.get('bottom-' + column)
                    i_neighbour = (i + 1) % 2
                    if top is None and bottom is None:
                        # merge each cell in this column with the neighbour on the same row
                        grid_template_areas[0][i] = grid_template_areas[0][i_neighbour]
                        grid_template_areas[1][i] = grid_template_areas[1][i_neighbour]
                    elif top is None:
                        # merge with the cell below
                        grid_template_areas[0][i] = grid_template_areas[1][i]
                    elif bottom is None:
                        # merge with the cell above
                        grid_template_areas[1][i] = grid_template_areas[0][i]

        grid_template_areas_css = "\n".join('"{}"'.format(" ".join(line))
                                            for line in grid_template_areas)

        self.layout.grid_template_columns = '1fr 1fr'
        self.layout.grid_template_rows = '1fr 1fr'
        self.layout.grid_template_areas = grid_template_areas_css

        self.children = tuple(children.values())


    @observe("top_left", "bottom_left", "top_right", "bottom_right")
    def _child_changed(self, change):
        self._update_layout()
