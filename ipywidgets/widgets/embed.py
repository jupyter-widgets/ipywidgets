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
from .widget import Widget
from .domwidget import DOMWidget
from .widget_link import Link


snippet_template = u"""<script src="{embed_url}"></script>
<script type="application/vnd.jupyter.widget-state+json">
{json_data}
</script>
{widget_views}
"""


html_template = u"""<!DOCTYPE html>
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

widget_view_template = u"""<script type="application/vnd.jupyter.widget-view+json">
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


def add_resolved_links(store, drop_defaults):
    """Checks if any link models exists between models in store"""
    for widget_id, widget in Widget.widgets.items(): # go over all widgets
        if isinstance(widget, Link) and widget_id not in store:
            if widget.source[0].model_id in store and widget.target[0].model_id in store:
                store[widget.model_id] = widget._get_embed_state(drop_defaults=drop_defaults)


def dependency_state(widgets, drop_defaults):
    """Get the state of all widgets specified, and their dependencies.

    In the below graph, D and E are depencies of C; C is a dependency of
    both A and B; and E is a dependency of F. That means the state of C
    will include (C, D, E).

    A --           -- D
        | -- C -- |
    B --           --
                     | -- E
                 F --

    ---- Dependecy ---->

    Note: Any links between included widgets will also be added. Using the
    example above, this means that any links between widgets (C, D, E) will
    also be included.

    """
    # collect the state of all relevant widgets
    if widgets is None:
        # Get state of all widgets, no smart resolution needed.
        widgets = Widget.widgets.values()
        state = Widget.get_manager_state(drop_defaults=drop_defaults, widgets=widgets)['state']
    else:
        state = {}
        for widget in widgets:
            get_recursive_state(widget, state, drop_defaults)
        # Add any links between included widgets:
        add_resolved_links(state, drop_defaults)
    return state


def embed_data(views, include_all=True, drop_defaults=True):
    """Gets data for embedding.

    Use this to get the raw data for embedding if you have special
    formatting needs.

    Parameters
    ----------
    views: widget or collection of widgets or None
        The widgets to include views for. If None, all DOMWidgets are
        included (not just the displayed ones).
    include_all: boolean
        Which other widgets' state to include. When set to True, the state
        of all widgets know to the widget manager is included. When False,
        the dependencies of the given views are (attempted) resolved
        automatically, and only their state is included.
    drop_defaults: boolean
        Whether to drop default values from the widget states.

    Returns
    -------
    A dictionary with the following entries:
        manager_state: dict of the widget manager state data
        view_specs: a list of widget view specs
    """
    if views is not None:
        try:
            views[0]
        except (IndexError, TypeError):
            views = [views]
    if include_all:
        state = Widget.get_manager_state(drop_defaults=drop_defaults, widgets=None)['state']
    else:
        state = dependency_state(views, drop_defaults)

    # Rely on ipywidget to get the default values
    json_data = Widget.get_manager_state(widgets=[])
    # but plug in our own state
    json_data['state'] = state

    if views is None:
        views = [w for w in Widget.widgets.values() if isinstance(w, DOMWidget)]

    view_specs = [w.get_view_spec() for w in views]

    return dict(manager_state=json_data, view_specs=view_specs)


def embed_snippet(views,
                  include_all=True,
                  drop_defaults=True,
                  indent=2,
                  embed_url=None,
                 ):
    """Return a snippet that can be embedded in an HTML file.

    Parameters
    ----------
    views: widget or collection of widgets or None
        The widgets to include views for. If None, all DOMWidgets are
        included (not just the displayed ones).
    include_all: boolean
        Which other widgets' state to include. When set to True, the state
        of all widgets know to the widget manager is included. When False,
        the dependencies of the given views are (attempted) resolved
        automatically, and only their state is included.
    drop_defaults: boolean
        Whether to drop default values from the widget states.
    indent: integer, string or None
        The indent to use for the JSON state dump. See `json.dumps` for
        full description.
    embed_url: string or None
        Allows for overriding the URL used to fetch the widget manager
        for the embedded code. This defaults (None) to an `unpkg` CDN url.

    Returns
    -------
    A unicode string with an HTML snippet containing several `<script>` tags.
    """

    data = embed_data(views, include_all, drop_defaults)

    widget_views = u'\n'.join(
        widget_view_template.format(**dict(view_spec=json.dumps(view_spec)))
        for view_spec in data['view_specs']
    )

    if embed_url is None:
        # TODO: Get widgets npm version automatically:
        embed_url = u'https://unpkg.com/jupyter-js-widgets@~3.0.0-alpha.0/dist/embed.js'

    values = {
        'embed_url': embed_url,
        'json_data': json.dumps(data['manager_state'], indent=indent),
        'widget_views': widget_views,
    }

    return snippet_template.format(**values)


def embed_minimal_html(fp, views, **kwargs):
    """Write a minimal HTML file with widget views embedded.

    Accepts keyword args similar to `embed_snippet`.
    """

    snippet = embed_snippet(views, **kwargs)

    values = {
        'title': u'IPyWidget export',
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
