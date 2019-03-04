from .widget import Widget
from .widget_box import GridBox
from .widget import register
from .widget_button import Button, ButtonStyle
from .widget_layout import Layout

from traitlets import Instance

class AppLayout(Widget):

    top_left = Instance(Widget, allow_none=True)
    bottom_left = Instance(Widget, allow_none=True)

    def __init__(self, **kwargs):
        super(AppLayout, self).__init__(**kwargs)

        children = []

        self.top_right = Button(layout=Layout(width='auto', height='auto'))
        self.bottom_right = Button(layout=Layout(width='auto', height='auto'))

        grid_template_areas = [["top-left", "top-right"],
                               ["bottom-left", "bottom-right"]]

        self.top_left.layout.grid_area = "top-left"
        self.top_right.layout.grid_area = "top-right"
        self.bottom_right.layout.grid_area = "bottom-right"

        children.append(self.top_left)
        children.append(self.bottom_right)
        children.append(self.top_right)

        if self.bottom_left is None:
            grid_template_areas[1][0] = "top-left"
        else:
            self.bottom_left.layout.grid_area = "bottom-left"
            children.append(self.bottom_left)

        print(grid_template_areas)

        grid_template_areas_css = "\n".join('"{}"'.format(" ".join(line))
                                            for line in grid_template_areas)
        self.layout = Layout(width='auto',
                             grid_template_columns='1fr 1fr',
                             grid_template_rows='1fr 1fr',
                             grid_template_areas=grid_template_areas_css)

        self._box = GridBox(
                            children=children,
                            layout=self.layout)

    def _ipython_display_(self, **kwargs):

        # delegate to GridBox class
        self._box._ipython_display_(**kwargs)
