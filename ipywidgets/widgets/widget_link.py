"""Link and DirectionalLink classes.

Propagate changes between widgets on the javascript side
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, widget_serialization
from traitlets import Unicode, Tuple, List,Instance, TraitError

class WidgetTraitTuple(Tuple):
    """Traitlet for validating a single (Widget, 'trait_name') pair"""
    
    def __init__(self, **kwargs):
        super(WidgetTraitTuple, self).__init__(Instance(Widget), Unicode, **kwargs)
    
    def validate_elements(self, obj, value):
        value = super(WidgetTraitTuple, self).validate_elements(obj, value)
        widget, trait_name = value
        trait = widget.traits().get(trait_name)
        trait_repr = "%s.%s" % (widget.__class__.__name__, trait_name)
        # Can't raise TraitError because the parent will swallow the message
        # and throw it away in a new, less informative TraitError
        if trait is None:
            raise TypeError("No such trait: %s" % trait_repr)
        elif not trait.get_metadata('sync'):
            raise TypeError("%s cannot be synced" % trait_repr)
        
        return value


class Link(Widget):
    """Link Widget
    
    one trait:
    source: a (Widget, 'trait_name') tuple for the source trait
    target: a (Widget, 'trait_name') tuple that should be updated
    """
    _model_name = Unicode('LinkModel', sync=True)
    target = WidgetTraitTuple(sync=True, **widget_serialization)
    source = WidgetTraitTuple(sync=True, **widget_serialization)

    def __init__(self, source, target, **kwargs):
        kwargs['source'] = source
        kwargs['target'] = target
        super(Link, self).__init__(**kwargs)

    # for compatibility with traitlet links
    def unlink(self):
        self.close()


def jslink(attr1, attr2):
    """Link two widget attributes on the frontend so they remain in sync.

    Parameters
    ----------
    source : a (Widget, 'trait_name') tuple for the first trait
    target : a (Widget, 'trait_name') tuple for the second trait

    Examples
    --------

    >>> c = link((widget1, 'value'), (widget2, 'value'))
    """
    return Link(attr1, attr2)


class DirectionalLink(Link):
    """A directional link
    
    source: a (Widget, 'trait_name') tuple for the source trait
    target: a (Widget, 'trait_name') tuple that should be updated
    when the source trait changes.
    """
    _model_name = Unicode('DirectionalLinkModel', sync=True)


def jsdlink(source, target):
    """Link a source widget attribute with a target widget attribute on the
    frontend.

    Parameters
    ----------
    source : a (Widget, 'trait_name') tuple for the source trait
    target : a (Widget, 'trait_name') tuple for the target trait

    Examples
    --------

    >>> c = dlink((src_widget, 'value'), (tgt_widget, 'value'))
    """
    return DirectionalLink(source, target)

