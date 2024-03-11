# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Widget."""

import inspect
import weakref
import gc

import pytest
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import display
from IPython.utils.capture import capture_output

from .. import widget
from ..widget import Widget
from ..widget_button import Button
from ..widget_box import VBox
import copy

import ipywidgets as ipw

def test_no_widget_view():
    # ensure IPython shell is instantiated
    # otherwise display() just calls print
    shell = InteractiveShell.instance()

    with capture_output() as cap:
        w = Widget()
        display(w)

    assert len(cap.outputs) == 1, "expect 1 output"
    mime_bundle = cap.outputs[0].data
    assert mime_bundle["text/plain"] == repr(w), "expected plain text output"
    assert (
        "application/vnd.jupyter.widget-view+json" not in mime_bundle
    ), "widget has no view"
    assert cap.stdout == "", repr(cap.stdout)
    assert cap.stderr == "", repr(cap.stderr)


def test_widget_view():
    # ensure IPython shell is instantiated
    # otherwise display() just calls print
    shell = InteractiveShell.instance()

    with capture_output() as cap:
        w = Button()
        display(w)

    assert len(cap.outputs) == 1, "expect 1 output"
    mime_bundle = cap.outputs[0].data
    assert mime_bundle["text/plain"] == repr(w), "expected plain text output"
    assert (
        "application/vnd.jupyter.widget-view+json" in mime_bundle
    ), "widget should have have a view"
    assert cap.stdout == "", repr(cap.stdout)
    assert cap.stderr == "", repr(cap.stderr)


def test_close_all():
    # create a couple of widgets
    widgets = [Button() for i in range(10)]

    assert len(widget._instances) > 0, "expect active widgets"
    assert widget._instances[widgets[0].model_id] is widgets[0]
    # close all the widgets
    Widget.close_all()

    assert len(widget._instances) == 0, "active widgets should be cleared"


def test_compatibility():
    button = Button()
    assert widget._instances[button.model_id] is button
    with pytest.deprecated_call() as record:
        assert widget._instances is widget.Widget.widgets
        assert widget._instances is widget.Widget._active_widgets
        assert widget._registry is widget.Widget.widget_types
        assert widget._registry is widget.Widget._widget_types

        Widget.close_all()
        assert not widget.Widget.widgets
        assert not widget.Widget._active_widgets
    caller_path = inspect.stack(context=0)[1].filename
    assert all(x.filename == caller_path for x in record)
    assert len(record) == 6


def test_widget_copy():
    button = Button()
    with pytest.raises(NotImplementedError):
        copy.copy(button)
    with pytest.raises(NotImplementedError):
        copy.deepcopy(button)


def test_widget_open():
    button = Button()
    assert not button.closed
    model_id = button.model_id
    assert model_id in widget._instances
    button.close()
    assert model_id not in widget._instances
    with pytest.raises(RuntimeError):
        button.open()
    

def test_gc():
    # Ensure the base instance of all widgets can be deleted / garbage collected.
    classes = {}
    for name, obj in ipw.__dict__.items():
        try:
            if issubclass(obj, ipw.Widget):
                classes[name] = obj
        except Exception:
            pass
    assert classes, "No Widget classes were found!"
    added = set()
    collected = set()
    objs = weakref.WeakSet()
    options = ({}, {"options": [1, 2, 4]}, {"n_rows": 1}, {"options": ["A"]})
    for n, obj in classes.items():
        w = None
        for kw in options:
            try:
                w = obj(**kw)
                w.comm
                added.add(n)
                break
            except Exception:
                pass
        if w:
            def on_delete(name=n):
                collected.add(name)

            weakref.finalize(w, on_delete)
            objs.add(w)
            # w should be the only strong ref to the widget. 
            # calling `del` should invoke its immediate deletion calling the `__del__` method.
            del w
    assert added, "No widgets were tested!"
    gc.collect()
    diff = added.difference(collected)
    assert not diff, f"Widgets not garbage collected: {diff}"


def test_gc_button():
    deleted = False
    b = Button()
    b.on_click(lambda x: setattr(b, "clicked", True))

    def on_delete():
        nonlocal deleted
        deleted = True

    b.click()
    assert getattr(b, "clicked")
    weakref.finalize(b, on_delete)
    del b
    gc.collect()
    assert deleted


def test_gc_box():
    # Test Box gc collected and children lifecycle managed.
    deleted = False
    b = VBox(children=[Button(description='button')])

    def on_delete():
        nonlocal deleted
        deleted = True

    weakref.finalize(b, on_delete)
    del b
    gc.collect()
    assert deleted

def test_gc_box_advanced():
    # A more advanced test for:
    # 1. A child widget is removed from the children when it is closed
    # 2. The children are discarded when the widget is closed.

    deleted = False
    
    b = VBox(
        children=[
            Button(description="b0"),
            Button(description="b1"),
            Button(description="b2"),
        ]
    )

    def on_delete():
        nonlocal deleted
        deleted = True

    weakref.finalize(b, on_delete)
    
    ids = [model_id for w in  b.children if (model_id:=w.model_id)  in widget._instances]
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
    assert not b1.closed, 'A removed widget should remain alive.'

    # b2 shouldn't have any strong references so should be deleted.
    assert ids[2] not in widget._instances, 'b2 should have been auto deleted.'
