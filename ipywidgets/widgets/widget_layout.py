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

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('LayoutView').tag(sync=True)
    _model_name = Unicode('LayoutModel').tag(sync=True)

    # Keys
    align_content = CUnicode().tag(sync=True)
    align_items = CUnicode().tag(sync=True)
    align_self = CUnicode().tag(sync=True)
    bottom = CUnicode().tag(sync=True)
    border = CUnicode().tag(sync=True)
    display = CUnicode().tag(sync=True)
    flex = CUnicode().tag(sync=True)
    flex_flow = CUnicode().tag(sync=True)
    height = CUnicode().tag(sync=True)
    justify_content = CUnicode().tag(sync=True)
    left = CUnicode().tag(sync=True)
    margin = CUnicode().tag(sync=True)
    max_height = CUnicode().tag(sync=True)
    max_width = CUnicode().tag(sync=True)
    min_height = CUnicode().tag(sync=True)
    min_width = CUnicode().tag(sync=True)
    overflow = CUnicode().tag(sync=True)
    overflow_x = CUnicode().tag(sync=True)
    overflow_y = CUnicode().tag(sync=True)
    padding = CUnicode().tag(sync=True)
    right = CUnicode().tag(sync=True)
    top = CUnicode().tag(sync=True)
    visibility = CUnicode().tag(sync=True)
    width = CUnicode().tag(sync=True)
