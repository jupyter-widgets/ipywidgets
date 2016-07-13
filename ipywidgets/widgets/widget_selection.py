"""Selection classes.

Represents an enumeration using a widget.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
from collections import OrderedDict

from .domwidget import DOMWidget
from .widget import register
from traitlets import (Unicode, Bool, Any, Dict, TraitError, CaselessStrEnum,
                       Tuple, List, Union, observe, validate)
from ipython_genutils.py3compat import unicode_type

def _value_to_label(value, obj):
    options = obj._make_options(obj.options)
    return next((k for k, v in options if obj.equals(v, value)), '')

def _label_to_value(k, obj):
    return obj._options_dict[k]


class _Selection(DOMWidget):
    """Base class for Selection widgets

    ``options`` can be specified as a list or dict. If given as a list,
    it will be transformed to a dict of the form ``{unicode_type(value): value}``.

    When programmatically setting the value, a reverse lookup is performed
    among the options to check that the value is valid. The reverse lookup uses
    the equality operator by default, but another predicate may be provided via
    the ``equals`` keyword argument. For example, when dealing with numpy arrays,
    one may set equals=np.array_equal.
    """

    value = Any(help="Selected value").tag(sync=True,
                                           to_json=_value_to_label,
                                           from_json=_label_to_value)

    options = Union([List(), Dict()],
    help="""List of (key, value) tuples or dict of values that the user can select.

    The keys of this list are the strings that will be displayed in the UI,
    representing the actual Python choices.

    The keys of this list are also available as _options_labels.
    """)
    _options_dict = Dict(read_only=True)
    _options_labels = Tuple(read_only=True).tag(sync=True)
    _options_values = Tuple(read_only=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)
    description = Unicode(help="Description of the value this widget represents").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)
        super(_Selection, self).__init__(*args, **kwargs)

    def _make_options(self, x):
        # Return a list of key-value pairs where the keys are strings
        # If x is a dict, convert it to list format.
        if isinstance(x, (OrderedDict, dict)):
            return [(unicode_type(k), v) for k, v in x.items()]

        # If x is an ordinary list, use the option values as names.
        for y in x:
            if not isinstance(y, (list, tuple)) or len(y) < 2:
                return [(unicode_type(i), i) for i in x]

        # Value is already in the correct format.
        return x

    @validate('options')
    def _validate_options(self, proposal):
        """Handles when the options tuple has been changed.

        Setting options implies setting option labels from the keys of the dict.
        """
        new = proposal['value']
        options = self._make_options(new)
        self.set_trait('_options_dict', { i[0]: i[1] for i in options })
        self.set_trait('_options_labels', [ i[0] for i in options ])
        self.set_trait('_options_values', [ i[1] for i in options ])
        return new

    @observe('options')
    def _value_in_options(self, change):
        # ensure that the chosen value is one of the choices
        if self._options_values:
            if self.value not in self._options_values:
                self.value = next(iter(self._options_values))

    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        if _value_to_label(value, self):
            return value
        else:
            raise TraitError('Invalid selection')


def _values_to_labels(values, obj):
    return tuple(_value_to_label(v, obj) for v in values)

def _labels_to_values(k, obj):
    return tuple(_label_to_value(l, obj) for l in k)


class _MultipleSelection(_Selection):
    """Base class for MultipleSelection widgets.

    As with ``_Selection``, ``options`` can be specified as a list or dict. If
    given as a list, it will be transformed to a dict of the form
    ``{unicode_type(value): value}``.

    Despite its name, the ``value`` attribute is a tuple, even if only a single
    option is selected.
    """

    value = Tuple(help="Selected values").tag(sync=True,
                  to_json=_values_to_labels, from_json=_labels_to_values)

    @observe('options')
    def _value_in_options(self, change):
        new_value = []
        for v in self.value:
            if v in self._options_dict.values():
                new_value.append(v)
        self.value = new_value

    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        if all(_value_to_label(v, self) for v in value):
            return value
        else:
            raise TraitError('Invalid selection')


@register('Jupyter.ToggleButtons')
class ToggleButtons(_Selection):
    """Group of toggle buttons that represent an enumeration.

    Only one toggle button can be toggled at any point in time.
    """
    _view_name = Unicode('ToggleButtonsView').tag(sync=True)
    _model_name = Unicode('ToggleButtonsModel').tag(sync=True)

    tooltips = List(Unicode()).tag(sync=True)
    icons = List(Unicode()).tag(sync=True)

    button_style = CaselessStrEnum(
        values=['primary', 'success', 'info', 'warning', 'danger', ''],
        default_value='', allow_none=True, help="""Use a predefined styling for
        the buttons.""").tag(sync=True)


@register('Jupyter.Dropdown')
class Dropdown(_Selection):
    """Allows you to select a single item from a dropdown."""
    _view_name = Unicode('DropdownView').tag(sync=True)
    _model_name = Unicode('DropdownModel').tag(sync=True)

    button_style = CaselessStrEnum(
        values=['primary', 'success', 'info', 'warning', 'danger', ''],
        default_value='', allow_none=True, help="""Use a predefined styling for
        the buttons.""").tag(sync=True)


@register('Jupyter.RadioButtons')
class RadioButtons(_Selection):
    """Group of radio buttons that represent an enumeration.

    Only one radio button can be toggled at any point in time.
    """
    _view_name = Unicode('RadioButtonsView').tag(sync=True)
    _model_name = Unicode('RadioButtonsModel').tag(sync=True)


@register('Jupyter.Select')
class Select(_Selection):
    """Listbox that only allows one item to be selected at any given time."""
    _view_name = Unicode('SelectView').tag(sync=True)
    _model_name = Unicode('SelectModel').tag(sync=True)


@register('Jupyter.SelectionSlider')
class SelectionSlider(_Selection):
    """Slider to select a single item from a list or dictionary."""
    _view_name = Unicode('SelectionSliderView').tag(sync=True)
    _model_name = Unicode('SelectionSliderModel').tag(sync=True)

    orientation = CaselessStrEnum(
        values=['horizontal', 'vertical'], default_value='horizontal',
        allow_none=False, help="Vertical or horizontal.").tag(sync=True)
    readout = Bool(True,
        help="Display the current selected label next to the slider").tag(sync=True)
    continuous_update = Bool(True,
        help="Update the value of the widget as the user is holding the slider.").tag(sync=True)


@register('Jupyter.SelectMultiple')
class SelectMultiple(_MultipleSelection):
    """Listbox that allows many items to be selected at any given time.

    Despite their names, inherited from ``_Selection``, the currently chosen
    option values, ``value``, or their labels, ``selected_labels`` must both be
    updated with a list-like object.
    """
    _view_name = Unicode('SelectMultipleView').tag(sync=True)
    _model_name = Unicode('SelectMultipleModel').tag(sync=True)
