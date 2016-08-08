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
    align_content = Unicode().tag(sync=True)
    align_items = Unicode().tag(sync=True)
    align_self = Unicode().tag(sync=True)
    bottom = Unicode().tag(sync=True)
    border = Unicode().tag(sync=True)
    display = Unicode().tag(sync=True)
    flex = Unicode().tag(sync=True)
    flex_flow = Unicode().tag(sync=True)
    height = Unicode().tag(sync=True)
    justify_content = Unicode().tag(sync=True)
    left = Unicode().tag(sync=True)
    margin = Unicode().tag(sync=True)
    max_height = Unicode().tag(sync=True)
    max_width = Unicode().tag(sync=True)
    min_height = Unicode().tag(sync=True)
    min_width = Unicode().tag(sync=True)
    overflow = Unicode().tag(sync=True)
    overflow_x = Unicode().tag(sync=True)
    overflow_y = Unicode().tag(sync=True)
    order = Unicode().tag(sync=True)
    padding = Unicode().tag(sync=True)
    right = Unicode().tag(sync=True)
    top = Unicode().tag(sync=True)
    visibility = Unicode().tag(sync=True)
    width = Unicode().tag(sync=True)
