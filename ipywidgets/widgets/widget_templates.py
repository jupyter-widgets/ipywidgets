from .widget import Widget
from .widget_box import GridBox
from .widget import register
from .widget_button import Button, ButtonStyle
from .widget_layout import Layout

from traitlets import Instance
from traitlets import observe

class AppLayout(GridBox):

    top_left = Instance(Widget, allow_none=True)
    top_right = Instance(Widget, allow_none=True)
    bottom_left = Instance(Widget, allow_none=True)
    bottom_right = Instance(Widget, allow_none=True)

    def __init__(self, **kwargs):
        super(AppLayout, self).__init__(**kwargs)

        self._update_layout()

    def _update_layout(self):


        grid_template_areas = [["top-left", "top-right"],
                               ["bottom-left", "bottom-right"]]

        all_children = {'top-left' : self.top_left,
                        'top-right' : self.top_right,
                        'bottom-left' : self.bottom_left,
                        'bottom-right' : self.bottom_right}

        children = {position : child for position, child in all_children.items()
                                     if child is not None}

        for position, child in children.items():
            child.layout.grid_area = position

        left = [self.top_left is None, self.bottom_left is None]
        right = [self.top_right is None, self.bottom_right is None]

        if all(left):
            grid_template_areas[0][0] = 'top-right'
            grid_template_areas[1][0] = 'bottom-right'
        elif any(left):
            if left[0] is None:
                grid_template_areas[0][0] = 'bottom-left'
            else:
                grid_template_areas[1][0] = 'top-left'

        grid_template_areas_css = "\n".join('"{}"'.format(" ".join(line))
                                            for line in grid_template_areas)
        self.layout = Layout(width='auto',
                             grid_template_columns='1fr 1fr',
                             grid_template_rows='1fr 1fr',
                             grid_template_areas=grid_template_areas_css)
        self.children = tuple(children.values())


    @observe("top_left", "bottom_left")
    def _child_changed(self, change):
        self._update_layout()
