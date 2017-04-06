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
from traitlets import (Unicode, Bool, Int, Any, Dict, TraitError, CaselessStrEnum,
                       Tuple, List, Union, observe, validate)
from ipython_genutils.py3compat import unicode_type

def _make_options(x):
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

def findvalue(array, value, compare = lambda x, y: x == y):
    "A function that uses the compare function to return a value from the list."
    try:
        return next(x for x in array if compare(x, value))
    except StopIteration:
        raise ValueError('%r not in array'%value)

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
    """

    value = Any(help="Selected value", allow_none=True)
    label = Unicode(help="Selected label", allow_none=True)
    index = Int(None, help="Selected index", allow_none=True).tag(sync=True)

    options = Tuple(
    help="""List of values, or (label, value) tuples, or a dict of {label: value} pairs that the user can select.

    As a convenience, if a dict or a list of values is assigned, it will be converted to a list of (label, value) pairs.

    The labels are the strings that will be displayed in the UI, representing the
    actual Python choices, and should be unique. If labels are not specified, they
    are generated from the values.
    """)
    # This being read-only means that it cannot be changed from the frontend!
    _options_labels = Tuple(read_only=True).tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)
        self._options_values = ()
        super(_Selection, self).__init__(*args, **kwargs)

    @validate('options')
    def _validate_options(self, proposal):
        return _make_options(proposal.value)

    @observe('options')
    def _propagate_options(self, change):
        "Unselect any option"
        self.index = None
        self.set_trait('_options_labels', tuple(i[0] for i in change.value))
        self._options_values = tuple(i[1] for i in change.value)

    @validate('index')
    def _validate_index(self, proposal):
        if proposal.value is None or 0 <= proposal.value < len(self.options):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    @observe('index')
    def _propagate_index(self, change):
        "Propagate changes in index to the value and label properties"
        label, value = self.options[change.value] if change.value is not None else (None, None)
        if self.label != label:
            self.label = label
        if self.value != value:
            self.value = value

    @validate('value')
    def _validate_value(self, proposal):
        value = proposal.value
        try:
            return findvalue(self._options_values, value, self.equals) if value is not None else None
        except ValueError:
            raise TraitError('Invalid selection: value not found')

    @observe('value')
    def _propagate_value(self, change):
        index = self._options_values.index(change.value) if change.value is not None else None
        if self.index != index:
            self.index = index

    @validate('label')
    def _validate_label(self, proposal):
        if (proposal.value is not None) and (proposal.value not in self._options_labels):
            raise TraitError('Invalid selection: label not found')
        return proposal.value

    @observe('label')
    def _propagate_label(self, change):
        index = self._options_labels.index(change.value) if change.value is not None else None
        if self.index != index:
            self.index = index

class _MultipleSelection(LabeledWidget, ValueWidget, CoreWidget):
    """Base class for multiple Selection widgets

    ``options`` can be specified as a list of values, list of (label, value)
    tuples, or a dict of {label: value}. The labels are the strings that will be
    displayed in the UI, representing the actual Python choices, and should be
    unique. If labels are not specified, they are generated from the values.

    When programmatically setting the value, a reverse lookup is performed
    among the options to check that the value is valid. The reverse lookup uses
    the equality operator by default, but another predicate may be provided via
    the ``equals`` keyword argument. For example, when dealing with numpy arrays,
    one may set equals=np.array_equal.
    """

    value = Tuple(help="Selected values")
    label = Tuple(help="Selected labels")
    index = Tuple(help="Selected indices").tag(sync=True)

    options = Tuple(
    help="""List of values, or (label, value) tuples, or a dict of {label: value} pairs that the user can select.

    As a convenience, if a dict or a list of values is assigned, it will be converted to a list of (label, value) pairs.

    The labels are the strings that will be displayed in the UI, representing the
    actual Python choices, and should be unique. If labels are not specified, they
    are generated from the values.
    """)
    # This being read-only means that it cannot be changed from the frontend!
    _options_labels = Tuple(read_only=True).tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)
        self._options_values = ()
        super(_MultipleSelection, self).__init__(*args, **kwargs)

    @validate('options')
    def _validate_options(self, proposal):
        return _make_options(proposal.value)

    @observe('options')
    def _propagate_options(self, change):
        "Unselect any option"
        self.index = ()
        self.set_trait('_options_labels', tuple(i[0] for i in change.value))
        self._options_values = tuple(i[1] for i in change.value)

    @validate('index')
    def _validate_index(self, proposal):
        "Check the range of each proposed index."
        if all(0 <= i < len(self.options) for i in proposal.value):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    @observe('index')
    def _propagate_index(self, change):
        "Propagate changes in index to the value and label properties"
        label = tuple(self._options_labels[i] for i in change.value)
        value = tuple(self._options_values[i] for i in change.value)
        # we check equality so we can avoid validation if possible
        if self.label != label:
            self.label = label
        if self.value != value:
            self.value = value

    @validate('value')
    def _validate_value(self, proposal):
        "Replace all values with the actual objects in the options list"
        try:
            return tuple(findvalue(self._options_values, i, self.equals) for i in proposal.value)
        except ValueError:
            raise TraitError('Invalid selection: value not found')

    @observe('value')
    def _propagate_value(self, change):
        index = tuple(self._options_values.index(i) for i in change.value)
        if self.index != index:
            self.index = index

    @validate('label')
    def _validate_label(self, proposal):
        if any(i not in self._options_labels for i in proposal.value):
            raise TraitError('Invalid selection: label not found')
        return proposal.value

    @observe('label')
    def _propagate_label(self, change):
        index = tuple(self._options_labels.index(i) for i in change.value)
        if self.index != index:
            self.index = index


@register
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
        default_value='', allow_none=True, help="""Use a predefined styling for the buttons.""").tag(sync=True)


@register
class Dropdown(_Selection):
    """Allows you to select a single item from a dropdown."""
    _view_name = Unicode('DropdownView').tag(sync=True)
    _model_name = Unicode('DropdownModel').tag(sync=True)


@register
class RadioButtons(_Selection):
    """Group of radio buttons that represent an enumeration.

    Only one radio button can be toggled at any point in time.
    """
    _view_name = Unicode('RadioButtonsView').tag(sync=True)
    _model_name = Unicode('RadioButtonsModel').tag(sync=True)


@register
class Select(_Selection):
    """Listbox that only allows one item to be selected at any given time."""
    _view_name = Unicode('SelectView').tag(sync=True)
    _model_name = Unicode('SelectModel').tag(sync=True)
    rows = Int(5).tag(sync=True)


@register
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


@register
class SelectMultiple(_MultipleSelection):
    """Listbox that allows many items to be selected at any given time.

    Despite their names, inherited from ``_Selection``, the currently chosen
    option values, ``value``, or their labels, ``selected_labels`` must both be
    updated with a list-like object.
    """
    _view_name = Unicode('SelectMultipleView').tag(sync=True)
    _model_name = Unicode('SelectMultipleModel').tag(sync=True)
    rows = Int(5).tag(sync=True)
