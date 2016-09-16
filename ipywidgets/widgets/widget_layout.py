"""Contains the Layout class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, register
from traitlets import Unicode


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
    align_content = Unicode(None, allow_none=True).tag(sync=True)
    align_items = Unicode(None, allow_none=True).tag(sync=True)
    align_self = Unicode(None, allow_none=True).tag(sync=True)
    bottom = Unicode(None, allow_none=True).tag(sync=True)
    border = Unicode(None, allow_none=True).tag(sync=True)
    display = Unicode(None, allow_none=True).tag(sync=True)
    flex = Unicode(None, allow_none=True).tag(sync=True)
    flex_flow = Unicode(None, allow_none=True).tag(sync=True)
    height = Unicode(None, allow_none=True).tag(sync=True)
    justify_content = Unicode(None, allow_none=True).tag(sync=True)
    left = Unicode(None, allow_none=True).tag(sync=True)
    margin = Unicode(None, allow_none=True).tag(sync=True)
    max_height = Unicode(None, allow_none=True).tag(sync=True)
    max_width = Unicode(None, allow_none=True).tag(sync=True)
    min_height = Unicode(None, allow_none=True).tag(sync=True)
    min_width = Unicode(None, allow_none=True).tag(sync=True)
    overflow = Unicode(None, allow_none=True).tag(sync=True)
    overflow_x = Unicode(None, allow_none=True).tag(sync=True)
    overflow_y = Unicode(None, allow_none=True).tag(sync=True)
    order = Unicode(None, allow_none=True).tag(sync=True)
    padding = Unicode(None, allow_none=True).tag(sync=True)
    right = Unicode(None, allow_none=True).tag(sync=True)
    top = Unicode(None, allow_none=True).tag(sync=True)
    visibility = Unicode(None, allow_none=True).tag(sync=True)
    width = Unicode(None, allow_none=True).tag(sync=True)
