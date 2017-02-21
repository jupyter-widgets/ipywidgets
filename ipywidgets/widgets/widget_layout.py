# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the Layout class"""

from traitlets import Unicode, Instance, CaselessStrEnum
from .widget_core import CoreWidget

CSS_PROPERTIES=['inherit', 'initial', 'unset']

class Layout(CoreWidget):
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
    align_content = CaselessStrEnum(['flex-start', 'flex-end', 'center', 'space-between',
        'space-around', 'space-evenly', 'stretch'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    align_items = CaselessStrEnum(['flex-start', 'flex-end', 'center',
        'baseline', 'stretch'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    align_self = CaselessStrEnum(['auto', 'flex-start', 'flex-end',
        'center', 'baseline', 'stretch'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    bottom = Unicode(None, allow_none=True).tag(sync=True)
    border = Unicode(None, allow_none=True).tag(sync=True)
    display = Unicode(None, allow_none=True).tag(sync=True)
    flex = Unicode(None, allow_none=True).tag(sync=True)
    flex_flow = Unicode(None, allow_none=True).tag(sync=True)
    height = Unicode(None, allow_none=True).tag(sync=True)
    justify_content = CaselessStrEnum(['flex-start', 'flex-end', 'center',
        'space-between', 'space-around'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    left = Unicode(None, allow_none=True).tag(sync=True)
    margin = Unicode(None, allow_none=True).tag(sync=True)
    max_height = Unicode(None, allow_none=True).tag(sync=True)
    max_width = Unicode(None, allow_none=True).tag(sync=True)
    min_height = Unicode(None, allow_none=True).tag(sync=True)
    min_width = Unicode(None, allow_none=True).tag(sync=True)
    overflow = CaselessStrEnum(['visible', 'hidden', 'scroll', 'auto'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    overflow_x = CaselessStrEnum(['visible', 'hidden', 'scroll', 'auto'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    overflow_y = CaselessStrEnum(['visible', 'hidden', 'scroll', 'auto'] + CSS_PROPERTIES, allow_none=True).tag(sync=True)
    order = Unicode(None, allow_none=True).tag(sync=True)
    padding = Unicode(None, allow_none=True).tag(sync=True)
    right = Unicode(None, allow_none=True).tag(sync=True)
    top = Unicode(None, allow_none=True).tag(sync=True)
    visibility = CaselessStrEnum(['visible', 'hidden']+CSS_PROPERTIES, allow_none=True).tag(sync=True)
    width = Unicode(None, allow_none=True).tag(sync=True)


class LayoutTraitType(Instance):

    klass = Layout

    def validate(self, obj, value):
        if isinstance(value, dict):
            return super(LayoutTraitType, self).validate(obj, Layout(**value))
        else:
            return super(LayoutTraitType, self).validate(obj, value)
