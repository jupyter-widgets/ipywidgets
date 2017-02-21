# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Trait types for html widgets.
"""

import re
import traitlets
import datetime as dt

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
