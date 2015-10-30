"""Contains the DOMWidget class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Unicode, Dict, Instance, Bool, List, \
    CaselessStrEnum, Tuple, CUnicode, Int, Set
from .widget import Widget, widget_serialization
from .trait_types import Color
from .style import Style

class DOMWidget(Widget):
    """Widget that can be inserted into the DOM"""
    
    visible = Bool(True, allow_none=True, help="Whether the widget is visible.  False collapses the empty space, while None preserves the empty space.", sync=True)
    _css = Tuple(sync=True, help="CSS property list: (selector, key, value)")
    _dom_classes = Tuple(sync=True, help="DOM classes applied to widget.$el.")

    style = Instance(Style, allow_none=True, sync=True, **widget_serialization)
    def _style_default():
        return Style()

    width = CUnicode(sync=True)
    height = CUnicode(sync=True)
    padding = CUnicode(sync=True)
    margin = CUnicode(sync=True)

    color = Color(None, allow_none=True, sync=True)
    background_color = Color(None, allow_none=True, sync=True)
    border_color = Color(None, allow_none=True, sync=True)

    border_width = CUnicode(sync=True)
    border_radius = CUnicode(sync=True)
    border_style = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_border-style.asp
        'none',
        'hidden',
        'dotted',
        'dashed',
        'solid',
        'double',
        'groove',
        'ridge',
        'inset',
        'outset',
        'initial',
        'inherit', ''],
        default_value='', sync=True)

    font_style = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_font_font-style.asp
        'normal',
        'italic',
        'oblique',
        'initial',
        'inherit', ''],
        default_value='', sync=True)
    font_weight = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_font_weight.asp
        'normal',
        'bold',
        'bolder',
        'lighter',
        'initial',
        'inherit', ''] + list(map(str, range(100,1000,100))),
        default_value='', sync=True)
    font_size = CUnicode(sync=True)
    font_family = Unicode(sync=True)

    def __init__(self, *pargs, **kwargs):
        super(DOMWidget, self).__init__(*pargs, **kwargs)

        def _validate_border(name, old, new):
            if new is not None and new != '':
                if name != 'border_width' and not self.border_width:
                    self.border_width = 1
                if name != 'border_style' and self.border_style == '':
                    self.border_style = 'solid'
        self.on_trait_change(_validate_border, ['border_width', 'border_style', 'border_color'])
