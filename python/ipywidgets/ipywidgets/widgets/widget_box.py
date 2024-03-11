# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Box widgets.

These widgets are containers that can be used to
group other widgets together and control their
relative layouts.
"""
import weakref

from .widget import register, widget_serialization, Widget
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from .docutils import doc_subst
from traitlets import Unicode, CaselessStrEnum, TraitType, observe
import sys

_doc_snippets = {}
_doc_snippets['box_params'] = """
    children: iterable of Widget instances
        list of widgets to display

    box_style: str
        one of 'success', 'info', 'warning' or 'danger', or ''.
        Applies a predefined style to the box. Defaults to '',
        which applies no pre-defined style.
"""

# TODO: remove once 3.8 support is dropped.
if sys.version_info < (3, 9):
    class Children(TraitType):
        default_value = ()

        def validate(self, obj:'Box', value):
            return tuple(v for v in value if isinstance(v, Widget) and not v.closed)
else:    
    class Children(TraitType[tuple[Widget],tuple[Widget]]):
        default_value = ()

        def validate(self, obj:'Box', value):
            return tuple(v for v in value if isinstance(v, Widget) and not v.closed)
            

@register
@doc_subst(_doc_snippets)
class Box(DOMWidget, CoreWidget):
    """ Displays multiple widgets in a group.

    The widgets are laid out horizontally.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.Box([title_widget, slider])
    """
    _model_name = Unicode('BoxModel').tag(sync=True)
    _view_name = Unicode('BoxView').tag(sync=True)

    # Child widgets in the container.
    # Using a tuple here to force reassignment to update the list.
    # When a proper notifying-list trait exists, use that instead.
    children = Children(help="List of widget children").tag(
        sync=True, **widget_serialization)

    box_style = CaselessStrEnum(
        values=['success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the box.""").tag(sync=True)

    def __init__(self, children=(), **kwargs):
        if children:
            kwargs['children'] = children
        super().__init__(**kwargs)

    @observe('children')
    def _box_observe_children(self, change):
        # Monitor widgets for when the comm is closed.
        handler = getattr(self, "_widget_children_comm_handler", None)
        if not handler:    
            ref = weakref.ref(self)
            def handler(change):
                self_ = ref()
                if self_ and change['owner']:
                    # Re-validation will discard all closed widgets.
                    self_.children = self_.children
                
            self._widget_children_comm_handler = handler      
        if change['new']:
            w:Widget
            for w in set(change['new']).difference(change['old'] or ()):
                w.observe(handler, names='comm')
        if change['old']:
            for w in set(change['old']).difference(change['new']):
                try:
                    w.unobserve(handler,  names='comm')
                except ValueError:
                    pass     


@register
@doc_subst(_doc_snippets)
class VBox(Box):
    """ Displays multiple widgets vertically using the flexible box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Vertical Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.VBox([title_widget, slider])
    """
    _model_name = Unicode('VBoxModel').tag(sync=True)
    _view_name = Unicode('VBoxView').tag(sync=True)


@register
@doc_subst(_doc_snippets)
class HBox(Box):
    """ Displays multiple widgets horizontally using the flexible box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Horizontal Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.HBox([title_widget, slider])
    """
    _model_name = Unicode('HBoxModel').tag(sync=True)
    _view_name = Unicode('HBoxView').tag(sync=True)


@register
class GridBox(Box):
    """ Displays multiple widgets in rows and columns using the grid box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Grid Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> button1 = widgets.Button(description='1')
    >>> button2 = widgets.Button(description='2')
    >>> # Create a grid with two columns, splitting space equally
    >>> layout = widgets.Layout(grid_template_columns='1fr 1fr')
    >>> widgets.GridBox([title_widget, slider, button1, button2], layout=layout)
    """
    _model_name = Unicode('GridBoxModel').tag(sync=True)
    _view_name = Unicode('GridBoxView').tag(sync=True)
