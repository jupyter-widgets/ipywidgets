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
from .domwidget import DOMWidget


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
{snippet}
</body>
</html>
"""

widget_view_template = """<script type="application/vnd.jupyter.widget-view+json">
{view_spec}
</script>"""


def _find_widget_refs_by_state(widget, state):
    """Find references to other widgets in a widget's state"""
    # Copy keys to allow changes to state during iteration:
    keys = tuple(state.keys())
    for key in keys:
        value = getattr(widget, key)
        # Trivial case: Direct references to other widgets:
        if isinstance(value, Widget):
            yield value
        # Also check for buried references in known, JSON-able structures
        # Note: This might miss references buried in more esoteric structures
        elif isinstance(value, (list, tuple)):
            for item in value:
                if isinstance(item, Widget):
                    yield item
        elif isinstance(value, dict):
            for item in value.values():
                if isinstance(item, Widget):
                    yield item


def get_recursive_state(widget, store=None, drop_defaults=False):
    """Gets the embed state of a widget, and all other widgets it refers to as well"""
    if store is None:
        store = dict()
    state = widget._get_embed_state(drop_defaults=drop_defaults)
    store[widget.model_id] = state

    # Loop over all values included in state (i.e. don't consider excluded values):
    for ref in _find_widget_refs_by_state(widget, state['state']):
        if ref.model_id not in store:
            get_recursive_state(ref, store, drop_defaults=drop_defaults)
    return store


def add_referring_widgets(store, drop_defaults):
    """Add state of any widgets referring to widgets already in the store"""
    found_new = False
    for widget_id, widget in Widget.widgets.items(): # go over all widgets
        if widget_id not in store:
            widget_state = widget.get_state(drop_defaults=drop_defaults)
            widget_state = _remove_buffers(widget_state)[0]
            # Loop over all references in current widget state:
            for ref in _find_widget_refs_by_state(widget, widget_state):
                # If the found ref is already in state, include the found reference
                if ref.model_id in store:
                    store[widget.model_id] = widget._get_embed_state(drop_defaults=drop_defaults)
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
        state = {}
        for widget in widgets:
            get_recursive_state(widget, state, drop_defaults)
        if dependents:
            # it may be that other widgets refer to the collected widgets,
            # such as layouts, include those as well
            while add_referring_widgets(state, drop_defaults):
                pass
    return state


def embed_data(widgets, expand_dependencies='full', drop_defaults=True):
    """Gets data for embedding.

    Use this to get the raw data for embedding if you have special
    formatting needs.

    Returns a dictionary with the following entries:
        manager_state: dict of the widget manager state data
        view_specs: a list of widget view specs
    """
    if widgets is not None:
        try:
            widgets[0]
        except (IndexError, TypeError):
            widgets = [widgets]
    if expand_dependencies in ('full', 'partial'):
        dependents = expand_dependencies == 'full'
        state = dependency_state(widgets, drop_defaults, dependents=dependents)
    else:
        state = Widget.get_manager_state(drop_defaults=drop_defaults, widgets=widgets)['state']

    # Rely on ipywidget to get the default values
    json_data = Widget.get_manager_state(widgets=[])
    # but plug in our own state
    json_data['state'] = state

    if widgets is None:
        widgets = [w for w in Widget.widgets.values() if isinstance(w, DOMWidget)]

    view_specs = [w.get_view_spec() for w in widgets]

    return dict(manager_state=json_data, view_specs=view_specs)


def embed_snippet(widgets,
                  expand_dependencies='full',
                  drop_defaults=True,
                  indent=2,
                  embed_url=None,
                 ):
    """Return a snippet that can be embedded in an HTML file. """

    data = embed_data(widgets, expand_dependencies, drop_defaults)

    widget_views = '\n'.join(
        widget_view_template.format(**dict(view_spec=json.dumps(view_spec)))
        for view_spec in data['view_specs']
    )

    if embed_url is None:
        # TODO: Get widgets npm version automatically:
        embed_url = 'https://unpkg.com/jupyter-js-widgets@~3.0.0-alpha.0/dist/embed.js'

    values = {
        'embed_url': embed_url,
        'json_data': json.dumps(data['manager_state'], indent=indent),
        'widget_views': widget_views,
    }

    return snippet_template.format(**values)


def embed_minimal_html(fp, widgets, **kwargs):
    """Write a minimal HTML file with widgets embedded.

    Accepts keyword args similar to `embed_snippet`.
    """

    snippet = embed_snippet(widgets, **kwargs)

    values = {
        'title': 'IPyWidget export',
        'snippet': snippet,
    }

    html_code = html_template.format(**values)

    # Check if fp is writable:
    if hasattr(fp, 'write'):
        fp.write(html_code)
    else:
        # Assume fp is a filename:
        with open(fp, "w") as f:
            f.write(html_code)
