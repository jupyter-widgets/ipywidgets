from .widget import Widget
from .widget_box import GridBox
from .widget import register
from .widget_button import Button, ButtonStyle
from .widget_layout import Layout

@register
class AppLayout(Widget):

    def __init__(self, **kwargs):
        super(AppLayout, self).__init__(**kwargs)
        self._box = GridBox()

        self._box = GridBox(children=[Button(layout=Layout(width='auto', height='auto'),
                                 style=ButtonStyle(button_color='darkseagreen')) for i in range(9)
                         ],
                layout=Layout(
                    width='50%',
                    grid_template_columns='100px 50px 100px',
                    grid_template_rows='80px auto 80px',
                    grid_gap='5px 10px')
               )
    def _ipython_display_(self, **kwargs):

        # delegate to GridBox class
        self._box._ipython_display_(**kwargs)
