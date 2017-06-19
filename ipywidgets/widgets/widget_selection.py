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
from itertools import chain

from .widget_description import DescriptionWidget
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
    * an iterable of (label, value) pairs
    * an iterable of values, and labels will be generated
    """
    # Check if x is a mapping of labels to values
    if isinstance(x, Mapping):
        return tuple((unicode_type(k), v) for k, v in x.items())

    # Check if x is an iterable of (label, value) pairs
    if all((isinstance(i, (list, tuple)) and len(i) == 2) for i in x):
        return tuple((unicode_type(k), v) for k, v in x)

    # Otherwise, assume x is an iterable of values
    return tuple((unicode_type(i), i) for i in x)

def findvalue(array, value, compare = lambda x, y: x == y):
    "A function that uses the compare function to return a value from the list."
    try:
        return next(x for x in array if compare(x, value))
    except StopIteration:
        raise ValueError('%r not in array'%value)

class _Selection(DescriptionWidget, ValueWidget, CoreWidget):
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

    value = Any(None, help="Selected value", allow_none=True)
    label = Unicode(None, help="Selected label", allow_none=True)
    index = Int(None, help="Selected index", allow_none=True).tag(sync=True)

    options = Any((),
    help="""Iterable of values, (label, value) pairs, or a mapping of {label: value} pairs that the user can select.

    Any assigned value is converted to a tuple of ('label', value) pairs.

    The labels are the strings that will be displayed in the UI, representing the
    actual Python choices, and should be unique.
    """)
    # This being read-only means that it cannot be changed from the frontend!
    _options_labels = Tuple(read_only=True, help="The labels for the options.").tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)

        # We have to make the basic options bookkeeping consistent
        # so we don't have errors the first time validators run
        self._initializing_traits_ = True
        options = _make_options(kwargs.get('options', ()))
        self.set_trait('_options_labels', tuple(i[0] for i in options))
        self._options_values = tuple(i[1] for i in options)

        # Select the first item by default, if we can
        if 'index' not in kwargs and 'value' not in kwargs and 'label' not in kwargs:
            kwargs['index'] = 0 if len(options) > 0 else None
            kwargs['label'], kwargs['value'] = options[0] if len(options) > 0 else (None, None)

        super(_Selection, self).__init__(*args, **kwargs)
        self._initializing_traits_ = False

    @validate('options')
    def _validate_options(self, proposal):
        return _make_options(proposal.value)

    @observe('options')
    def _propagate_options(self, change):
        "Unselect any option if we aren't initializing"
        self.set_trait('_options_labels', tuple(i[0] for i in change.new))
        self._options_values = tuple(i[1] for i in change.new)
        if self._initializing_traits_ is not True:
            self.index = 0 if len(change.new) > 0 else None

    @validate('index')
    def _validate_index(self, proposal):
        if proposal.value is None or 0 <= proposal.value < len(self._options_labels):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    @observe('index')
    def _propagate_index(self, change):
        "Propagate changes in index to the value and label properties"
        label = self._options_labels[change.new] if change.new is not None else None
        value = self._options_values[change.new] if change.new is not None else None
        if self.label is not label:
            self.label = label
        if self.value is not value:
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
        index = self._options_values.index(change.new) if change.new is not None else None
        if self.index != index:
            self.index = index

    @validate('label')
    def _validate_label(self, proposal):
        if (proposal.value is not None) and (proposal.value not in self._options_labels):
            raise TraitError('Invalid selection: label not found')
        return proposal.value

    @observe('label')
    def _propagate_label(self, change):
        index = self._options_labels.index(change.new) if change.new is not None else None
        if self.index != index:
            self.index = index

    def _repr_keys(self):
        keys = super(_Selection, self)._repr_keys()
        # Include options manually, as it isn't marked as synced:
        for key in sorted(chain(keys, ('options',))):
            if key == 'index' and self.index == 0:
                # Index 0 is default when there are options
                continue
            yield key


class _MultipleSelection(DescriptionWidget, ValueWidget, CoreWidget):
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

    options = Any(
    help="""Iterable of values, (label, value) pairs, or a mapping of {label: value} pairs that the user can select.

    Any assigned value is converted to a tuple of ('label', value) pairs.

    The labels are the strings that will be displayed in the UI, representing the
    actual Python choices, and should be unique.
    """)
    # This being read-only means that it cannot be changed from the frontend!
    _options_labels = Tuple(read_only=True, help="The labels for the options.").tag(sync=True)

    disabled = Bool(help="Enable or disable user changes").tag(sync=True)

    def __init__(self, *args, **kwargs):
        self.equals = kwargs.pop('equals', lambda x, y: x == y)

        # We have to make the basic options bookkeeping consistent
        # so we don't have errors the first time validators run
        self._initializing_traits_ = True
        options = _make_options(kwargs.get('options', ()))
        self.set_trait('_options_labels', tuple(i[0] for i in options))
        self._options_values = tuple(i[1] for i in options)

        super(_MultipleSelection, self).__init__(*args, **kwargs)
        self._initializing_traits_ = False

    @validate('options')
    def _validate_options(self, proposal):
        return _make_options(proposal.value)

    @observe('options')
    def _propagate_options(self, change):
        "Unselect any option"
        if self._initializing_traits_ is not True:
            self.index = ()
        self.set_trait('_options_labels', tuple(i[0] for i in change.new))
        self._options_values = tuple(i[1] for i in change.new)

    @validate('index')
    def _validate_index(self, proposal):
        "Check the range of each proposed index."
        if all(0 <= i < len(self._options_labels) for i in proposal.value):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    @observe('index')
    def _propagate_index(self, change):
        "Propagate changes in index to the value and label properties"
        label = tuple(self._options_labels[i] for i in change.new)
        value = tuple(self._options_values[i] for i in change.new)
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
        index = tuple(self._options_values.index(i) for i in change.new)
        if self.index != index:
            self.index = index

    @validate('label')
    def _validate_label(self, proposal):
        if any(i not in self._options_labels for i in proposal.value):
            raise TraitError('Invalid selection: label not found')
        return proposal.value

    @observe('label')
    def _propagate_label(self, change):
        index = tuple(self._options_labels.index(i) for i in change.new)
        if self.index != index:
            self.index = index

    def _repr_keys(self):
        keys = super(_MultipleSelection, self)._repr_keys()
        # Include options manually, as it isn't marked as synced:
        for key in sorted(chain(keys, ('options',))):
            yield key


@register
class ToggleButtons(_Selection):
    """Group of toggle buttons that represent an enumeration.

    Only one toggle button can be toggled at any point in time.
    """
    _view_name = Unicode('ToggleButtonsView').tag(sync=True)
    _model_name = Unicode('ToggleButtonsModel').tag(sync=True)

    tooltips = List(Unicode(), help="Tooltips for each button.").tag(sync=True)
    icons = List(Unicode(), help="Icons names for each button (FontAwesome names without the fa- prefix).").tag(sync=True)

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
    rows = Int(5, help="The number of rows to display.").tag(sync=True)

@register
class _SelectionNonempty(_Selection):
    """Selection that is guaranteed to have a value selected."""
    # don't allow None to be an option.
    value = Any(help="Selected value")
    label = Unicode(help="Selected label")
    index = Int(help="Selected index").tag(sync=True)

    @validate('options')
    def _validate_options(self, proposal):
        options = _make_options(proposal.value)
        if len(options) == 0:
            raise TraitError("Option list must be nonempty")
        return options

@register
class SelectionSlider(_SelectionNonempty):
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
    rows = Int(5, help="The number of rows to display.").tag(sync=True)

@register
class SelectionRangeSlider(_MultipleSelection):
    """Slider to select a single item from a list or dictionary."""
    _view_name = Unicode('SelectionRangeSliderView').tag(sync=True)
    _model_name = Unicode('SelectionRangeSliderModel').tag(sync=True)

    value = Tuple(help="Min and max selected values")
    label = Tuple(help="Min and max selected labels")
    index = Tuple((0,0), help="Min and max selected indices").tag(sync=True)

    @validate('options')
    def _validate_options(self, proposal):
        options = _make_options(proposal.value)
        if len(options) == 0:
            raise TraitError("Option list must be nonempty")
        return options

    @observe('options')
    def _propagate_options(self, change):
        "Unselect any option"
        if self._initializing_traits_ is not True:
            self.index = (0, 0)
        self.set_trait('_options_labels', tuple(i[0] for i in change.new))
        self._options_values = tuple(i[1] for i in change.new)

    @validate('index')
    def _validate_index(self, proposal):
        "Make sure we have two indices and check the range of each proposed index."
        if len(proposal.value) != 2:
            raise TraitError('Invalid selection: index must have two values, but is %r'%(proposal.value,))
        if all(0 <= i < len(self._options_labels) for i in proposal.value):
            return proposal.value
        else:
            raise TraitError('Invalid selection: index out of bounds')

    orientation = CaselessStrEnum(
        values=['horizontal', 'vertical'], default_value='horizontal',
        allow_none=False, help="Vertical or horizontal.").tag(sync=True)
    readout = Bool(True,
        help="Display the current selected label next to the slider").tag(sync=True)
    continuous_update = Bool(True,
        help="Update the value of the widget as the user is holding the slider.").tag(sync=True)
