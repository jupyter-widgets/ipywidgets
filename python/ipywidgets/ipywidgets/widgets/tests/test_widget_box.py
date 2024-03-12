# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import gc
import weakref

from unittest import TestCase

from traitlets import TraitError

import ipywidgets as widgets


class TestBox(TestCase):

    def test_construction(self):
        box = widgets.Box()
        assert box.get_state()['children'] == []

    def test_construction_with_children(self):
        html = widgets.HTML('some html')
        slider = widgets.IntSlider()
        box = widgets.Box([html, slider])
        children_state = box.get_state()['children']
        assert children_state == [
            widgets.widget._widget_to_json(html, None),
            widgets.widget._widget_to_json(slider, None),
        ]

    def test_construction_style(self):
        box = widgets.Box(box_style='warning')
        assert box.get_state()['box_style'] == 'warning'

    def test_construction_invalid_style(self):
        with self.assertRaises(TraitError):
            widgets.Box(box_style='invalid')


def test_box_gc():
    # Test Box gc collected and children lifecycle managed.
    deleted = False
    b = widgets.VBox(children=[widgets.Button(description='button')])

    def on_delete():
        nonlocal deleted
        deleted = True

    weakref.finalize(b, on_delete)
    del b
    gc.collect()
    assert deleted

def test_box_child_closed_observe_childen():

    b1 = widgets.Button(description='button')
    b = widgets.VBox(children=[b1], observe_children=True)
    b1.close()
    assert b1 not in b.children

def test_box_child_closed_not_observe_childen():

    b1 = widgets.Button(description='button')
    b = widgets.GridBox(children=[b1], observe_children=False)
    b1.close()
    assert b1 in b.children

def test_box_gc_advanced():
    # A more advanced test for:
    # 1. A child widget is removed from the children when it is closed
    # 2. The children are discarded when the widget is closed.

    deleted = False
    
    b = widgets.VBox(
        children=[
            widgets.Button(description="b0"),
            widgets.Button(description="b1"),
            widgets.Button(description="b2"),
        ]
    )

    def on_delete():
        nonlocal deleted
        deleted = True

    weakref.finalize(b, on_delete)
    
    ids = [model_id for w in  b.children if (model_id:=w.model_id)  in widgets.widget._instances]
    assert len(ids) == 3, 'Not all button comms were registered.'

    # keep a strong ref to `b1`
    b1 = b.children[1] 

    # When a widget is closed it should be removed from the box.children.
    b.children[0].close()
    assert len(b.children) == 2, "b0 not removed."
    
    # When the ref to box is removed it should be deleted.
    del b
    assert deleted, "`b` should have been the only strong ref to the box."
    # assert not b.children, '`children` should be removed when the widget is closed.'
    assert b1.comm, 'A removed widget should remain alive.'

    # b2 shouldn't have any strong references so should be deleted.
    assert ids[2] not in widgets.widget._instances, 'b2 should have been auto deleted.'
