# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Selection classes.

Represents an enumeration using a widget.
"""

from collections import Mapping
try:
    from itertools import izip
except ImportError:  #python3.x
    izip = zip

from .domwidget import LabeledWidget
from .valuewidget import ValueWidget
from .widget_core import CoreWidget
from .widget import register
from traitlets import (Unicode, Bool, Any, Dict, TraitError, CaselessStrEnum,
                       Tuple, List, Union, observe, validate)
from ipython_genutils.py3compat import unicode_type

def _value_to_label(value, obj):
    """Convert a value to a label, given a _Selection object.

    Raises a KeyError if the value is not found."""
    # We can't rely on _options_labels and _options_values since we
    # might be called before the options are validated and those are filled.
    # TODO: make a separate validation function so this doesn't have
    # to redo the work of parsing the options object.
    options = obj._make_options(obj.options)
    if len(obj.options) == 0 and value is None:
        return ''
    else:
        try:
            # return the first label whose value is equal to the desired value
            return next(l for (l, v) in options if obj.equals(v, value))
        except StopIteration:
            raise KeyError(value)

def _label_to_value(label, obj):
    """Convert a label to a value, given a _Selection object."""
    if len(obj._options_dict) == 0 and label == '':
        return None
    else:
        return obj._options_dict[label]


class _Selection(LabeledWidget, ValueWidget, CoreWidget):
    """Base class for Selection widgets

    ``options`` can be specified as a list of values, list of (label, value)
    tuples, or a dict of {label: value}. The labels are the strings that will be
    displayed in the UI, representing the actual Python choices, and should be
    unique. If labels are not specified, they are generated from the values.

    When programmatically setting the value, a reverse lookup is performed
    among the options to check that the value is valid. The reverse lookup uses
    the equality operator by default, but another predicate may be provided via
    the ``equals`` keyword argument. For example, when dealing with numpy arrays,
    one may set equals=np.array_equal.

    Only labels are synced (values are converted to/from labels), so the labels should
    be unique.
    """

    value = Any(help="Selected value").tag(sync=True,
                                           to_json=_value_to_label,
                                           from_json=_label_to_value)

    options = Union([List(), Dict()],
    help="""List of values, or (label, value) tuples, or a dict of {label: value} pairs that the user can select.

    The labels are the strings that will be displayed in the UI, representing the
    actual Python choices, and should be unique. If labels are not specified, they
    are generated from the values.

    The keys are also available as _options_labels.
    """)
    _options_dict = Dict(read_only=True)
    _options_labels = Tuple(read_only=True).tag(sync=True)
    _options_values = Tuple(read_only=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)
        super(_Selection, self).__init__(*args, **kwargs)

    def _make_options(self, x):
        """Standardize the options list format.

        The returned list should be in the format [('label', value), ('label', value), ...].

        The input can be
        * a Mapping of labels to values
        * an iterable of values (of which at least one is not a list or tuple of length 2)
        * an iterable with entries that are lists or tuples of the form ('label', value)
        """
        # Return a list of key-value pairs where the keys are strings
        # If x is a dict, convert it to list format.
        if isinstance(x, Mapping):
            return [(unicode_type(k), v) for k, v in x.items()]

        # If any entry of x is not a list or tuple of length 2, convert
        # the entries to unicode for the labels.
        for y in x:
            if not (isinstance(y, (list, tuple)) and len(y) == 2):
                return [(unicode_type(i), i) for i in x]

        # x is already in the correct format: a list of 2-tuples.
        # The first element of each tuple should be unicode, this might
        # not yet be the case.
        return [(unicode_type(k), v) for k, v in x]

    @validate('options')
    def _validate_options(self, proposal):
        """Handles when the options tuple has been changed.

        Setting options with a dict implies setting option labels from the keys of the dict.
        """
        new = proposal['value']
        options = self._make_options(new)
        self.set_trait('_options_dict', dict(options))
        self.set_trait('_options_labels', [ i[0] for i in options ])
        self.set_trait('_options_values', [ i[1] for i in options ])
        return new

    @observe('options')
    def _value_in_options(self, change):
        "Ensure the value is an option; if not, set to the first value"
        # ensure that the chosen value is still one of the options
        if len(self.options) == 0:
            self.value = None
        else:
            try:
                _value_to_label(self.value, self)
            except KeyError:
                self.value = self._options_values[0]

    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        if len(self.options) == 0:
            if value is None:
                return value
            else:
                raise TraitError('Invalid selection: empty options list')
        else:
            try:
                _value_to_label(value, self)
                return value
            except KeyError:
                raise TraitError('Invalid selection')


def _values_to_labels(values, obj):
    "Convert values to labels from a _MultipleSelection object"
    return tuple(_value_to_label(v, obj) for v in values)

def _labels_to_values(k, obj):
    "Convert labels to values from a _MultipleSelection object"
    return tuple(_label_to_value(l, obj) for l in k)


class _MultipleSelection(_Selection):
    """Base class for MultipleSelection widgets.

    As with ``_Selection``, ``options`` can be specified as a list or dict.

    Despite its name, the ``value`` attribute is a tuple, even if only a single
    option is selected.
    """
    _model_name = Unicode('MultipleSelectionModel').tag(sync=True)

    value = Tuple(help="Selected values").tag(sync=True,
                  to_json=_values_to_labels, from_json=_labels_to_values)

    @observe('options')
    def _value_in_options(self, change):
        "Filter and reset the current value to make sure it is valid."
        new_value = []
        for v in self.value:
            try:
                _value_to_label(v, self)
                new_value.append(v)
            except KeyError:
                continue
        if len(self.value) != len(new_value):
            self.value = tuple(new_value)

    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        try:
            for v in value:
                _value_to_label(v, self)
            return value
        except KeyError as k:
            raise TraitError('Invalid selection: %r'%(k.args[0],))


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
