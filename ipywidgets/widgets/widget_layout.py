"""Contains the Layout class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, register
from traitlets import Unicode, CUnicode


class Layout(Widget):
    """Layout specification

    Defines a layout that can be expressed using CSS.  Supports a subset of
    https://developer.mozilla.org/en-US/docs/Web/CSS/Reference

    When a property is also accessible via a shorthand property, we only
    expose the shorthand.

    For example:
    - ``flex-grow``, ``flex-shrink`` and ``flex-basis`` are bound to ``flex``.
    - ``flex-wrap`` and ``flex-direction`` are bound to ``flex-flow``.
    - ``margin-[top/bottom/left/right]`` values are bound to ``margin``, etc.
    """

    _view_name = Unicode('LayoutView', sync=True)

    # Keys
    align_content = CUnicode(sync=True)
    align_items = CUnicode(sync=True)
    align_self = CUnicode(sync=True)
    bottom = CUnicode(sync=True)
    border = CUnicode(sync=True)
    display = CUnicode(sync=True)
    flex = CUnicode(sync=True)
    flex_flow = CUnicode(sync=True)
    height = CUnicode(sync=True)
    justify_content = CUnicode(sync=True)
    left = CUnicode(sync=True)
    margin = CUnicode(sync=True)
    overflow = CUnicode(sync=True)
    padding = CUnicode(sync=True)
    right = CUnicode(sync=True)
    top = CUnicode(sync=True)
    visibility = CUnicode(sync=True)
    width = CUnicode(sync=True)

