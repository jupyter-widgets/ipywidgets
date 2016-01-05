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
    align_content = CUnicode(sync=True, allow_none=True)
    align_items = CUnicode(sync=True, allow_none=True)
    align_self = CUnicode(sync=True, allow_none=True)
    bottom = CUnicode(sync=True, allow_none=True)
    display = CUnicode(sync=True, allow_none=True)
    flex = CUnicode(sync=True, allow_none=True)
    flex_flow = CUnicode(sync=True, allow_none=True)
    height = CUnicode(sync=True, allow_none=True)
    justify_content = CUnicode(sync=True, allow_none=True)
    left = CUnicode(sync=True, allow_none=True)
    margin = CUnicode(sync=True, allow_none=True)
    overflow = CUnicode(sync=True, allow_none=True)
    padding = CUnicode(sync=True, allow_none=True)
    right = CUnicode(sync=True, allow_none=True)
    top = CUnicode(sync=True, allow_none=True)
    visibility = CUnicode(sync=True, allow_none=True)
    width = CUnicode(sync=True, allow_none=True)

