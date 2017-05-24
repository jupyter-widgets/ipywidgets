# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
#
#
# Parts of this code is copied from IPyVolume (24.05.2017), under the following license:
#
# MIT License
#
# Copyright (c) 2016 Maarten Breddels
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

"""
Functions for generating embeddable HTML/javascript of a widget.
"""

import json
from .widget import Widget, _remove_buffers


snippet_template = """<script src="{embed_url}"></script>
<script type="application/vnd.jupyter.widget-state+json">
{json_data}
</script>
{widget_views}
"""


html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
</head>
<body>
%s
</body>
</html>
""" % snippet_template

widget_view_template = """<script type="application/vnd.jupyter.widget-view+json">
{view_spec}
</script>"""


def _get_widgets_in_state(state):
    for key in state.keys():
        yield Widget.widgets[key]


def get_recursive_state(widget, store=None, drop_defaults=False):
    """Gets the embed state of a widget, and all other widgets it refers to as well"""
    if store is None:
        store = dict()
    state = widget._get_embed_state(drop_defaults=drop_defaults)
    store[widget.model_id] = state
    for key in state['state'].keys():
        value = getattr(widget, key)
        if isinstance(value, Widget):
            get_recursive_state(value, store, drop_defaults=drop_defaults)
        elif isinstance(value, (list, tuple)):
            for item in value:
                if isinstance(item, Widget):
                    get_recursive_state(item, store, drop_defaults=drop_defaults)
        elif isinstance(value, dict):
            for item in value.values():
                if isinstance(item, Widget):
                    get_recursive_state(item, store, drop_defaults=drop_defaults)
    return store


def add_referring_widgets(states, drop_defaults=False):
    """Add state of any widgets referring to widgets already in the store"""
    found_new = False
    for widget_id, widget in Widget.widgets.items(): # go over all widgets
        #print("widget", widget, widget_id)
        if widget_id not in states:
            #print("check members")
            widget_state = widget.get_state(drop_defaults=drop_defaults)
            widget_state = _remove_buffers(widget_state)[0]
            widgets_found = []
            for key, value in widget_state.items():
                value = getattr(widget, key)
                if isinstance(value, Widget):
                    widgets_found.append(value)
                elif isinstance(value, (list, tuple)):
                    for item in value:
                        if isinstance(item, Widget):
                            widgets_found.append(item)
                elif isinstance(value, dict):
                    for item in value.values():
                        if isinstance(item, Widget):
                            widgets_found.append(item)
            #print("found", widgets_found)
            for widgets_found in widgets_found:
                if widgets_found.model_id in states:
                    #print("we found that we needed to add ", widget_id, widget)
                    states[widget.model_id] = widget._get_embed_state(drop_defaults=drop_defaults)
                    found_new = True
    return found_new


def dependency_state(widgets, drop_defaults, dependents=True):
    """Get the state of all widgets specified, and their dependencies.

    If `dependents` is True (the default), widgets which depend on any of the
    resolved widgets will be added as well.

    In the below graph, D and E are depencies of C; A and B are dependents of C;
    and F is an dependent of E. That means the state will include (C, D, E) for
    dependents=False, and (A, B, C, D, E, F) for dependents=True.

    A --           -- D
        | -- C -- |
    B --           --
                     | -- E
                 F --

    ---- Dependecy ---->
    """
    # collect the state of all relevant widgets
    if widgets is None:
        widgets = Widget.widgets.values()
        state = Widget.get_manager_state(drop_defaults=drop_defaults, widgets=widgets)['state']
    else:
        try:
            widgets[0]
        except (IndexError, TypeError):
            widgets = [widgets]
        state = {}
        for widget in widgets:
            get_recursive_state(widget, state, drop_defaults=drop_defaults)
        if dependents:
            # it may be that other widgets refer to the collected widgets,
            # such as layouts, include those as well
            while add_referring_widgets(state):
                pass
    return state


def embed_data(widgets=None, expand_dependencies='full', drop_defaults=True):
    """Gets data for embedding.

    Use this to get the raw data for embedding if you have special
    formatting needs.

    Returns a dictionary with the following entries:
        manager_state: dict of the widget manager state data
        view_specs: a list of widget view specs
    """
    if expand_dependencies in ('full', 'partial'):
        dependents = expand_dependencies == 'full'
        state = dependency_state(widgets, drop_defaults, dependents=dependents)
        widgets = tuple(_get_widgets_in_state(state))
    else:
        state = Widget.get_manager_state(drop_defaults=drop_defaults, widgets=widgets)['state']

    # Rely on ipywidget to get the default values
    json_data = Widget.get_manager_state(widgets=[])
    # but plug in our own state
    json_data['state'] = state

    return dict(manager_state=json_data, view_specs=[w.get_view_spec() for w in widgets])


def embed_snippet(widgets=None,
                  expand_dependencies='full',
                  drop_defaults=True,
                  indent=2,
                 ):
    """Return a snippet that can be embedded in an HTML file. """

    data = embed_data(widgets, expand_dependencies, drop_defaults)

    widget_views = '\n'.join(
        widget_view_template.format(**dict(view_spec=json.dumps(view_spec)))
        for view_spec in data['view_specs']
    )

    values = {
        # TODO: Get widgets npm version automatically:
        'embed_url':'https://unpkg.com/jupyter-js-widgets@~3.0.0-alpha.0/dist/embed.js',
        'json_data': json.dumps(data['manager_state'], indent=indent),
        'widget_views': widget_views,
    }

    return snippet_template.format(**values)


def embed_minimal_html(fp,
                       widgets=None,
                       expand_dependencies='full',
                       drop_defaults=False,
                       indent=2,
                       title='',
                      ):
    """Write a minimal HTML file with widgets embedded."""

    data = embed_data(widgets, expand_dependencies, drop_defaults)

    widget_views = '\n'.join(
        widget_view_template.format(**dict(view_spec=json.dumps(view_spec)))
        for view_spec in data['view_specs']
    )

    values = {
        # TODO: Get widgets npm version automatically:
        "embed_url":"https://unpkg.com/jupyter-js-widgets@~3.0.0-alpha.0/dist/embed.js",
        'json_data': json.dumps(data['manager_state'], indent=indent),
        'widget_views': widget_views,
        'title': title,
    }

    html_code = html_template.format(**values)

    # Check if fp is writable:
    if hasattr(fp, 'write'):
        fp.write(html_code)
    else:
        # Assume fp is a filename:
        with open(fp, "w") as f:
            f.write(html_code)
