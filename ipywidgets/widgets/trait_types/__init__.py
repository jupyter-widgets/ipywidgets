# encoding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Trait types for html widgets.
"""

import re
import traitlets
import datetime as dt
from . import eventful

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


class Datetime(traitlets.TraitType):
    """A trait type holding a Python datetime object"""

    klass = dt.datetime
    default_value = dt.datetime(1900, 1, 1)

def datetime_to_json(pydt, manager):
    """Serializes a Python datetime object to json.

    Instantiating a JavaScript Date object with a string assumes that the
    string is a UTC string, while instantiating it with constructor arguments
    assumes that it's in local time:

    >>> cdate = new Date('2015-05-12')
    Mon May 11 2015 20:00:00 GMT-0400 (Eastern Daylight Time)
    >>> cdate = new Date(2015, 4, 12) // Months are 0-based indices in JS
    Tue May 12 2015 00:00:00 GMT-0400 (Eastern Daylight Time)

    Attributes of this dictionary are to be passed to the JavaScript Date
    constructor.
    """
    if pydt is None:
        return None
    else:
        return dict(
            year=pydt.year,
            month=pydt.month - 1,  # Months are 0-based indices in JS
            date=pydt.day,
            hours=pydt.hour,       # Hours, Minutes, Seconds and Milliseconds are
            minutes=pydt.minute,   # plural in JS
            seconds=pydt.second,
            milliseconds=pydt.microsecond / 1000
        )

def datetime_from_json(js, manager):
    """Deserialize a Python datetime object from json"""
    if js is None:
        return None
    else:
        return dt.datetime(
            js['year'],
            js['month'] + 1,  # Months are 1-based in Python
            js['date'],
            js['hours'],
            js['minutes'],
            js['seconds'],
            js['milliseconds'] * 1000
        )

datetime_serialization = {
    'from_json': datetime_from_json,
    'to_json': datetime_to_json
}

class InstanceDict(traitlets.Instance):
    """An instance trait which coerces a dict to an instance.
    
    This lets the instance be specified as a dict, which is used to initialize the instance.
    
    Also, we default to a trivial instance, even if args and kwargs is not specified."""

    def validate(self, obj, value):
        if isinstance(value, dict):
            return super(InstanceDict, self).validate(obj, self.klass(**value))
        else:
            return super(InstanceDict, self).validate(obj, value)

    def make_dynamic_default(self):
        return self.klass(*(self.default_args or ()),
                          **(self.default_kwargs or {}))


class EDict(eventful.Eventful, traitlets.Dict):

    event_map = {
        'setitem': ('__setitem__', 'setdefault'),
        'delitem': ('__delitem__', 'pop'),
        'update': 'update',
        'clear': 'clear',
    }
    type_name = 'edict'

    def _before_update(self, inst, call):
        new = call.args[0]
        new.update(call.kwargs)
        call_list = []
        return self.redirect(
            None, 'setitem', inst,
            args=new.items())

    def _before_clear(self, inst, call):
        return self.redirect(
            None, 'delitem', inst,
            args=inst.keys())

    @staticmethod
    def before_setitem(inst, call):
        """Expect call.args[0] = key"""
        key, old = call.args[0], inst.get(call.args[0], traitlets.Undefined)
        def after_setitem(returned):
            new = inst.get(key, traitlets.Undefined)
            if not equivalent(old, new):
                return traitlets.Bunch(key=key, old=old, new=new)
        return after_setitem

    _before_setitem = before_setitem
    _before_delitem = before_setitem


class EList(eventful.Eventful, traitlets.List):

    event_map = {
        'append': 'append',
        'extend': 'extend',
        'setitem': '__setitem__',
        'reverse': 'reverse',
        'sort': 'sort',
    }
    type_name = 'elist'

    def before_setitem(self, inst, index):
        try:
            old = inst[index]
        except:
            old = traitlets.Undefined
        def after_setitem(returned):
            try:
                new = inst[index]
            except:
                new = traitlets.Undefined
            if not equivalent(old, new):
                return traitlets.Bunch(index=index, old=old, new=new)
        return after_setitem

    def _before_setitem(self, inst, call):
        return self.before_setitem(inst, call.args[0])

    def rearrangement(self, origin, inst):
        return self.redirect(origin, 'setitem', inst,
            args=[(i,) for i in range(len(inst))])

    def _before_reverse(self, inst, call):
        return self.rearrangement(inst, 'reverse')

    def _before_sort(self, inst, call):
        return self.rearrangement(inst, 'sort')

    def _before_extend(self, inst, call):
        size = len(call.args[0])
        return self.redirect('append', 'setitem', inst,
            args=[(i+len(inst),) for i in range(size)])

    def _before_append(self, inst, call):
        return self.redirect_once('append',
            'setitem', inst, (len(inst),))
