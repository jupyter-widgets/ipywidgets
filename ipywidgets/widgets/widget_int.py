"""Int class.

Represents an unbounded int using a widget.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .domwidget import DOMWidget
from .widget import register
from .trait_types import Color
from traitlets import (Unicode, CInt, Bool, CaselessStrEnum, Tuple, TraitError,
                       validate)

_int_doc_t = """
Parameters
----------
value: integer
    The initial value.
"""

_bounded_int_doc_t = """
Parameters
----------
value: integer
    The initial value.
min: integer
    The lower limit for the value.
max: integer
    The upper limit for the value.
step: integer
    The step between allowed values.
"""

def _int_doc(cls):
    """Add int docstring template to class init."""
    def __init__(self, value=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        super(cls, self).__init__(**kwargs)

    __init__.__doc__ = _int_doc_t
    cls.__init__ = __init__
    return cls

def _bounded_int_doc(cls):
    """Add bounded int docstring template to class init."""
    def __init__(self, value=None, min=None, max=None, step=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        if min is not None:
            kwargs['min'] = min
        if max is not None:
            kwargs['max'] = max
        if step is not None:
            kwargs['step'] = step
        super(cls, self).__init__(**kwargs)

    __init__.__doc__ = _bounded_int_doc_t
    cls.__init__ = __init__
    return cls


class _Int(DOMWidget):
    """Base class for widgets that represent an integer."""
    value = CInt(0, help="Int value").tag(sync=True)
    disabled = Bool(False, help="Enable or disable user changes").tag(sync=True)
    description = Unicode(help="Description of the value this widget represents").tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    def __init__(self, value=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        super(_Int, self).__init__(**kwargs)


class _BoundedInt(_Int):
    """Base class for widgets that represent an integer bounded from above and below.
    """
    step = CInt(1, help="Minimum step to increment the value (ignored by some views)").tag(sync=True)
    max = CInt(100, help="Max value").tag(sync=True)
    min = CInt(0, help="Min value").tag(sync=True)

    def __init__(self, value=None, min=None, max=None, step=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        if min is not None:
            kwargs['min'] = min
        if max is not None:
            kwargs['max'] = max
        if step is not None:
            kwargs['step'] = step
        super(_BoundedInt, self).__init__(**kwargs)

    @validate('value')
    def _validate_value(self, proposal):
        """Cap and floor value"""
        value = proposal['value']
        if self.min > value or self.max < value:
            value = min(max(value, self.min), self.max)
        return value

    @validate('min')
    def _validate_min(self, proposal):
        """Enforce min <= value <= max"""
        min = proposal['value']
        if min > self.max:
            raise TraitError('setting min > max')
        if min > self.value:
            self.value = min
        return min

    @validate('max')
    def _validate_max(self, proposal):
        """Enforce min <= value <= max"""
        max = proposal['value']
        if max < self.min:
            raise TraitError('setting max < min')
        if max < self.value:
            self.value = max
        return max

@register('Jupyter.IntText')
@_int_doc
class IntText(_Int):
    """Textbox widget that represents an integer."""
    _view_name = Unicode('IntTextView').tag(sync=True)
    _model_name = Unicode('IntTextModel').tag(sync=True)


@register('Jupyter.BoundedIntText')
@_bounded_int_doc
class BoundedIntText(_BoundedInt):
    """Textbox widget that represents an integer bounded from above and below.
    """
    _view_name = Unicode('IntTextView').tag(sync=True)
    _model_name = Unicode('IntTextModel').tag(sync=True)


@register('Jupyter.IntSlider')
@_bounded_int_doc
class IntSlider(_BoundedInt):
    """Slider widget that represents an integer bounded from above and below.
    """
    _view_name = Unicode('IntSliderView').tag(sync=True)
    _model_name = Unicode('IntSliderModel').tag(sync=True)
    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)
    _range = Bool(False, help="Display a range selector").tag(sync=True)
    readout = Bool(True, help="Display the current value of the slider next to it.").tag(sync=True)
    readout_format = Unicode('d', help="Format for the readout").tag(sync=True)
    slider_color = Color(None, allow_none=True).tag(sync=True)
    continuous_update = Bool(True, help="Update the value of the widget as the user is holding the slider.").tag(sync=True)


@register('Jupyter.IntProgress')
@_bounded_int_doc
class IntProgress(_BoundedInt):
    """Progress bar that represents an integer bounded from above and below.
    """
    _view_name = Unicode('ProgressView').tag(sync=True)
    _model_name = Unicode('ProgressModel').tag(sync=True)

    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)

    bar_style = CaselessStrEnum(
        values=['success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the progess bar.""").tag(sync=True)


class _IntRange(_Int):
    value = Tuple(CInt(), CInt(), default_value=(0, 1),
                  help="Tuple of (lower, upper) bounds").tag(sync=True)

    @property
    def lower(self):
        return self.value[0]

    @lower.setter
    def lower(self, lower):
        self.value = (lower, self.value[1])

    @property
    def upper(self):
        return self.value[1]

    @upper.setter
    def upper(self, upper):
        self.value = (self.value[0], upper)

    @validate('value')
    def _validate_value(self, proposal):
        lower, upper = proposal['value']
        if upper < lower:
            raise TraitError('setting lower > upper')
        return lower, upper


class _BoundedIntRange(_IntRange):
    step = CInt(1, help="Minimum step that the value can take (ignored by some views)").tag(sync=True)
    max = CInt(100, help="Max value").tag(sync=True)
    min = CInt(0, help="Min value").tag(sync=True)

    def __init__(self, *args, **kwargs):
        min, max = kwargs.get('min', 0), kwargs.get('max', 100)
        if not kwargs.get('value', None):
            kwargs['value'] = (0.75 * min + 0.25 * max,
                               0.25 * min + 0.75 * max)
        super(_BoundedIntRange, self).__init__(*args, **kwargs)

    @validate('min', 'max')
    def _validate_bounds(self, proposal):
        trait = proposal['trait']
        new = proposal['value']
        if trait.name == 'min' and new > self.max:
            raise TraitError('setting min > max')
        if trait.name == 'max' and new < self.min:
            raise TraitError('setting max < min')
        if trait.name == 'min':
            self.value = (max(new, self.value[0]), max(new, self.value[1]))
        if trait.name == 'max':
            self.value = (min(new, self.value[0]), min(new, self.value[1]))
        return new

    @validate('value')
    def _validate_value(self, proposal):
        lower, upper = super(_BoundedIntRange, self)._validate_value(proposal)
        lower, upper = min(lower, self.max), min(upper, self.max)
        lower, upper = max(lower, self.min), max(upper, self.min)
        return lower, upper


@register('Jupyter.IntRangeSlider')
class IntRangeSlider(_BoundedIntRange):
    """Slider/trackbar that represents a pair of ints bounded by minimum and maximum value.

    Parameters
    ----------
    value : int tuple
        The pair (`lower`, `upper`) of integers
    min : int
        The lowest allowed value for `lower`
    max : int
        The highest allowed value for `upper`
    """
    _view_name = Unicode('IntSliderView').tag(sync=True)
    _model_name = Unicode('IntSliderModel').tag(sync=True)
    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)
    _range = Bool(True, help="Display a range selector").tag(sync=True)
    readout = Bool(True, help="Display the current value of the slider next to it.").tag(sync=True)
    slider_color = Color(None, allow_none=True).tag(sync=True)
    continuous_update = Bool(True, help="Update the value of the widget as the user is sliding the slider.").tag(sync=True)
