# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as widgets
from ipywidgets.widgets.widget_link import Link

from traitlets import CaselessStrEnum, Unicode, Tuple, List, Bool, CFloat, Float, CInt, Int, Instance, Dict, Any
from ipywidgets import Color
from ipywidgets.widgets.trait_types import TypedTuple

header = '''# Model State

This is a description of the model state for each widget in the core Jupyter widgets library. The model ID of a widget is the id of the comm object the widget is using. A reference to a widget is serialized to JSON as a string of the form `"IPY_MODEL_<MODEL_ID>"`, where `<MODEL_ID>` is the model ID of a previously created widget of the specified type.

This model specification is for ipywidgets 7.4.*, @jupyter-widgets/base 1.1.*, and @jupyter-widgets/controls 1.4.*.

## Model attributes

Each widget in the Jupyter core widgets is represented below. The heading represents the model name, module, and version, view name, module, and version that the widget is registered with.

'''

widgets_to_document = sorted(widgets.Widget.widget_types.items())

def typing(x):
    s = ''
    if isinstance(x, CaselessStrEnum):
        s = 'string (one of %s)'%(', '.join('`%r`'%i for i in x.values))
    elif isinstance(x, Unicode):
        s = 'string'
    elif isinstance(x, (Tuple, List)):
        s = 'array'
    elif isinstance(x, TypedTuple):
        s = 'array of ' + typing(x._trait)
    elif isinstance(x, Bool):
        s = 'boolean'
    elif isinstance(x, (CFloat, Float)):
        s = 'number (float)'
    elif isinstance(x, (CInt, Int)):
        s = 'number (integer)'
    elif isinstance(x, Color):
        s = 'string (valid color)'
    elif isinstance(x, Dict):
        s = 'object'
    elif isinstance(x, Instance) and issubclass(x.klass, widgets.Widget):
        s = 'reference to %s widget'%(x.klass.__name__)
        # ADD the widget to this documenting list
        if x.klass not in [i[1] for i in widgets_to_document] and x.klass != widgets.Widget:
            widgets_to_document.append((x.klass.__name__, x.klass))
    elif isinstance(x, Any):
        # In our case, these all happen to be values that are converted to strings
        s = 'string (valid option label)'
    else:
        s = x.__class__.__name__
    if x.allow_none:
        s = "`null` or "+s
    return s

def jsdefault(t):
    x = t.default_value
    if isinstance(t, Instance):
        x = t.make_dynamic_default()
        if issubclass(t.klass, widgets.Widget):
            return 'reference to new instance'
    if x is True:
        return '`true`'
    elif x is False:
        return '`false`'
    elif x is None:
        return '`null`'
    elif isinstance(x, tuple):
        return '`{0}`'.format(list(x))
    else:
        return '`%s`'%t.default_value_repr()

def format_widget(n, w):
    out = []
    name = dict(zip(['m_module', 'm_version', 'model', 'v_module', 'v_version', 'view'], n))

    out.append('### %(model)s (%(m_module)s, %(m_version)s); %(view)s (%(v_module)s, %(v_version)s)'%name)
    out.append('')
    out.append('{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='Attribute', typing='Type', 
                                                                              default='Default', help='Help'))
    out.append('{0:-<16}-|-{0:-<16}-|-{0:-<16}-|----'.format('-'))
    for name, t in sorted(w.traits(sync=True).items()):
        if name in ('_model_module', '_view_module', '_model_module_version', '_view_module_version', 
                    '_dom_classes', 'layout'):
            # document these separately, since they apply to all classes
            pass
        if name in ('_view_count'):
            # don't document this since it is totally experimental at this point
            continue

        s = '{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='`%s`'%name, typing=typing(t), 
                                                            allownone='*' if t.allow_none else '', 
                                                                                               default=jsdefault(t),
                                                                                              help=t.help if t.help else '')
        out.append(s)
    out.append('')
    return '\n'.join(out)

out = header
for n,w in widgets_to_document:
    if issubclass(w, Link):
        out += '\n'+format_widget(n, w((widgets.IntSlider(), 'value'), (widgets.IntSlider(), 'value')))
    elif issubclass(w, widgets.SelectionRangeSlider) or issubclass(w, widgets.SelectionSlider):
        out += '\n'+format_widget(n,w(options=[1]))
    else:
        out += '\n'+format_widget(n,w())
print(out)
