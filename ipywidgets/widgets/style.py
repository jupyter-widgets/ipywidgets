"""Contains the Style class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, register
from traitlets import Unicode, CUnicode

@register('IPython.Button')
class Style(Widget):
    """Style specification
    
    Defines a style that can be expressed using CSS.  Supports a subset of
    https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
    """
    
    _view_name = Unicode('StyleView', sync=True)

    # Keys
    align_content = CUnicode(sync=True, allow_none=True)
    align_items = CUnicode(sync=True, allow_none=True)
    align_self = CUnicode(sync=True, allow_none=True)
    bottom = CUnicode(sync=True, allow_none=True)
    display = CUnicode(sync=True, allow_none=True)
    flex = CUnicode(sync=True, allow_none=True)
    flex_basis = CUnicode(sync=True, allow_none=True)
    flex_direction = CUnicode(sync=True, allow_none=True)
    flex_flow = CUnicode(sync=True, allow_none=True)
    flex_grow = CUnicode(sync=True, allow_none=True)
    flex_shrink = CUnicode(sync=True, allow_none=True)
    flex_wrap = CUnicode(sync=True, allow_none=True)
    height = CUnicode(sync=True, allow_none=True)
    justify_content = CUnicode(sync=True, allow_none=True)
    left = CUnicode(sync=True, allow_none=True)
    margin = CUnicode(sync=True, allow_none=True)
    padding = CUnicode(sync=True, allow_none=True)
    right = CUnicode(sync=True, allow_none=True)
    top = CUnicode(sync=True, allow_none=True)
    visibility = CUnicode(sync=True, allow_none=True)
    width = CUnicode(sync=True, allow_none=True)
    