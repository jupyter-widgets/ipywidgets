# encoding: utf-8
"""
Trait types for html widgets.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import re
import traitlets

from . import eventful

def _widget_to_json(x):
    if isinstance(x, dict):
        return {k: _widget_to_json(v) for k, v in x.items()}
    elif isinstance(x, (list, tuple)):
        return [_widget_to_json(v) for v in x]
    elif isinstance(x, traitlets.HasTraits):
        return "IPY_MODEL_" + x.model_id
    else:
        return x


class BaseSignaling(traitlets.BaseTraitType):
    """This is used as a base class for both Signals and Slots.
    This is a hook into MetaHasTrait metaclass."""    
 
    def __init__(self, trait_type=None):
        """The constructor takes a trait type specifying
        the signature of the signal."""
        if trait_type is None:
            trait_type = traitlets.Any()
        self.trait_type = trait_type

    @property
    def this_class(self):
        """The `this_class` property rebings to the `this_class` attribute
        of the underlying trait type"""
        return self.trait_type.this_class

    @this_class.setter
    def this_class(self, this_class):
        """The setter for the `this_class` property is called in the
        __init__ method of the MetaHasTraits class."""
        self.trait_type.this_class = this_class

    @property
    def name(self):
        """The `name` property rebings to the `name` attribute
        of the underlying trait type"""
        return self.trait_type.name

    @name.setter
    def name(self, name):
        """The setter for the `name` property is called in the
        __new__ method of the MetaHasTraits class."""
        self.trait_type.name = name

    def instance_init(self, obj):
        """Part of the initialization that depend on the underlying
        HasTrait instance
            - calls instance_init on the underlying trait type
        """
        self.trait_type.instance_init(obj)

    def validate(self, obj, value):
        """Rebinds to the underlying trait type validation"""
        return self.trait_type._validate(obj, value)

    def get_metadata(self, key, default=None):
        """Rebinds to the underlying trait type get_metadata"""
        return self.trait_type.get_metadata(key, default)

class Signal(BaseSignaling):

     def instance_init(self, obj):
         """Constructs the instance-level signal"""
         super(Signal, self).instance_init(obj)
         setattr(obj, self.name, _Signal(obj, self))


class _Signal(object):
    """Main Signal object, mirroring front-end's Signal object, this object
    is not meant to be directly instantiated by the user."""

    def __init__(self, model, signal):
        self.model = model
        self.signal = signal

    def connect(self, slot):
        """Sends a `connect` signal to the front-end. This causes the
        connection of a slot to the signal in the frontend.

        Slot connections are not de-duplicated. If the slot is connected
        multiple times, it will be invoked multiple times when the signal
        is emitted.
        """
        self.model._send({
            'method': 'connect',
            'name': self.signal.name,
            'slot': _widget_to_json({
                'model': slot.model,
                'name': slot.name,
            }),
        })

    def disconnect(self, slot):
        """Sends a `disconnect` signal to the front-end.

        This will remove all connections to the slot, even if the slot was
        connected multple times. If no slot is provided, all slots will be
        disconnected."""
        self.model._send({
            'method': 'disconnect',
            'name': self.signal.name,
            'slot': _widget_to_json({
                'model': slot.model,
                'name': slot.name, 
            }),
        })

    def emit(self, value=None):
        """Emits a signal with the provided value. The value is validated of
        the argument is validated.

        Slots are invoked in the order in which they were connected."""
        to_json = self.signal.trait_type.get_metadata('to_json',
                                                      self.model._trait_to_json)
        self.model._send({
            'method': 'emit',
            'name': self.signal.name,
            'value': to_json(self.signal.validate(self.model, value)),
        })


class Slot(BaseSignaling):

     def instance_init(self, obj):
         """Constructs the instance-level signal"""
         super(Slot, self).instance_init(obj)
         setattr(obj, self.name, _Slot(obj, self))


class _Slot(object):
    """Main Slot object, mirroring front-end's Slot object, this object
    is not meant to be directly instantiated by the user."""

    def __init__(self, model, slot):
        self.model = model
        self.slot = slot

    def invoke(self, value=None):
        to_json = self.slot.trait_type.get_metadata('to_json',
                                                    self.model._trait_to_json)
        self.model._send({
            'method': 'invoke',
            'name': self.slot.name,
            'value': to_json(self.slot.validate(self.model, value)),
        })

    @property
    def name(self):
        return self.slot.name


_color_names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred ', 'indigo ', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'] 
_color_re = re.compile(r'#[a-fA-F0-9]{3}(?:[a-fA-F0-9]{3})?$')


class Color(traitlets.Unicode):
    """A string holding a valid HTML color such as 'blue', '#060482', '#A80'"""

    info_text = 'a valid HTML color'
    default_value = traitlets.Undefined

    def validate(self, obj, value):
        if value.lower() in _color_names or _color_re.match(value):
            return value
        self.error(obj, value)


class EventfulDict(traitlets.Instance):
    """An instance of an EventfulDict."""

    def __init__(self, default_value={}, **metadata):
        """Create a EventfulDict trait type from a dict.

        The default value is created by doing
        ``eventful.EvenfulDict(default_value)``, which creates a copy of the
        ``default_value``.
        """
        if default_value is None:
            args = None
        elif isinstance(default_value, dict):
            args = (default_value,)
        elif isinstance(default_value, SequenceTypes):
            args = (default_value,)
        else:
            raise TypeError('default value of EventfulDict was %s' % default_value)

        super(EventfulDict, self).__init__(klass=eventful.EventfulDict, args=args,
                                           **metadata)


class EventfulList(traitlets.Instance):
    """An instance of an EventfulList."""

    def __init__(self, default_value=None, **metadata):
        """Create a EventfulList trait type from a dict.

        The default value is created by doing 
        ``eventful.EvenfulList(default_value)``, which creates a copy of the 
        ``default_value``.
        """
        if default_value is None:
            args = ((),)
        else:
            args = (default_value,)

        super(EventfulList, self).__init__(klass=eventful.EventfulList, args=args,
                                           **metadata)


