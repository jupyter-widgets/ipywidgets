from .widget import Widget
from .widget_box import GridBox
from .widget import register
from .widget_button import Button, ButtonStyle
from .widget_layout import Layout

from traitlets import Instance

class AppLayout(Widget):

    left_top = Instance(Widget)

    def __init__(self, **kwargs):
        super(AppLayout, self).__init__(**kwargs)

        left_top = self.left_top
        left_bottom = Button(layout=Layout(width='auto', height='auto'))
        right_top = Button(layout=Layout(width='auto', height='auto'))
        right_bottom = Button(layout=Layout(width='auto', height='auto'))

        grid_layout = Layout(grid_template_columns='50% 50%',
                             grid_template_rows='50% 50%')

        self._box = GridBox(children=[left_top,
                                      right_top,
                                      left_bottom,
                                      right_bottom],
                            layout=grid_layout)

    def _ipython_display_(self, **kwargs):

        # delegate to GridBox class
        self._box._ipython_display_(**kwargs)
