from traitlets import Instance, Bool
from traitlets import observe

from .widget import Widget
from .widget_box import GridBox
from .widget_layout import Layout

class TwoByTwoLayout(GridBox):
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

    """

    top_left = Instance(Widget, allow_none=True)
    top_right = Instance(Widget, allow_none=True)
    bottom_left = Instance(Widget, allow_none=True)
    bottom_right = Instance(Widget, allow_none=True)
    merge = Bool(default_value=True)


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
