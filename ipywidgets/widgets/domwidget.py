"""Contains the DOMWidget class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Unicode, Dict, Instance, Bool, List, \
    CaselessStrEnum, Tuple, CUnicode, Int, Set, observe
from .widget import Widget, widget_serialization
from .trait_types import Color
from .widget_layout import Layout
from warnings import warn # TODO: Remove when traitlet deprection is removed post 5.0

class DOMWidget(Widget):
    """Widget that can be inserted into the DOM"""

    _model_name = Unicode('DOMWidgetModel').tag(sync=True)

    visible = Bool(True, allow_none=True, help="Whether the widget is visible.  False collapses the empty space, while None preserves the empty space.").tag(sync=True)  # TODO: Deprecated in ipywidgets 5.0
    _dom_classes = Tuple(help="DOM classes applied to widget.$el.").tag(sync=True)

    layout = Instance(Layout, allow_none=True).tag(sync=True, **widget_serialization)
    def _layout_default(self):
        return Layout()

    width = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    height = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    padding = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    margin = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0

    color = Color(None, allow_none=True).tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    background_color = Color(None, allow_none=True).tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    border_color = Color(None, allow_none=True).tag(sync=True) # TODO: Deprecated in ipywidgets 5.0

    border_width = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    border_radius = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    border_style = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_border-style.asp # TODO: Deprecated in ipywidgets 5.0
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
        default_value='').tag(sync=True)

    font_style = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_font_font-style.asp # TODO: Deprecated in ipywidgets 5.0
        'normal',
        'italic',
        'oblique',
        'initial',
        'inherit', ''],
        default_value='').tag(sync=True)
    font_weight = CaselessStrEnum(values=[ # http://www.w3schools.com/cssref/pr_font_weight.asp # TODO: Deprecated in ipywidgets 5.0
        'normal',
        'bold',
        'bolder',
        'lighter',
        'initial',
        'inherit', ''] + list(map(str, range(100,1000,100))),
        default_value='').tag(sync=True)
    font_size = CUnicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0
    font_family = Unicode().tag(sync=True) # TODO: Deprecated in ipywidgets 5.0

    def __init__(self, *pargs, **kwargs):
        super(DOMWidget, self).__init__(*pargs, **kwargs)

        # Deprecation added in 5.0.  TODO: Remove me and corresponging traits.
        self._deprecate_traits(['width', 'height', 'padding', 'margin', 'color',
        'background_color', 'border_color', 'border_width', 'border_radius',
        'border_style', 'font_style', 'font_weight', 'font_size', 'font_family',
        'visible'])

    @observe('border_width', 'border_style', 'border_color')
    def _update_border(self, change):
        name, new = change['name'], change['new']
        if new is not None and new != '':
            if name != 'border_width' and not self.border_width:
                self.border_width = 1
            if name != 'border_style' and self.border_style == '':
                self.border_style = 'solid'

    def add_class(self, className):
        """
        Adds a class to the top level element of the widget.

        Doesn't add the class if it already exists.
        """
        if className not in self._dom_classes:
            self._dom_classes = list(self._dom_classes) + [className]
        return self

    def remove_class(self, className):
        """
        Removes a class from the top level element of the widget.

        Doesn't remove the class if it doesn't exist.
        """
        if className in self._dom_classes:
            self._dom_classes = [c for c in self._dom_classes if c != className]
        return self

    def _deprecate_traits(self, traits): # TODO: Deprecation added in 5.0.  Remove me and corresponging traits.
        def traitWarn(change):
            warn("%s deprecated" % change['name'], DeprecationWarning)
        self.observe(traitWarn, names=traits)
