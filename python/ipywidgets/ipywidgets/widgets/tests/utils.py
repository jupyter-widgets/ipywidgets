# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ipykernel.comm import Comm
from ipywidgets import Widget
import ipywidgets.widgets.widget

class DummyComm(Comm):
    comm_id = 'a-b-c-d'
    kernel = 'Truthy'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.messages = []

    def open(self, *args, **kwargs):
        pass

    def send(self, *args, **kwargs):
        self.messages.append((args, kwargs))

    def close(self, *args, **kwargs):
        pass

_widget_attrs = {}
undefined = object()

def setup_test_comm():
    Widget.comm.klass = DummyComm
    ipywidgets.widgets.widget.Comm = DummyComm
    _widget_attrs['_repr_mimebundle_'] = Widget._repr_mimebundle_
    def raise_not_implemented(*args, **kwargs):
        raise NotImplementedError()
    Widget._repr_mimebundle_ = raise_not_implemented

def teardown_test_comm():
    Widget.comm.klass = Comm
    ipywidgets.widgets.widget.Comm = Comm
    for attr, value in _widget_attrs.items():
        if value is undefined:
            delattr(Widget, attr)
        else:
            setattr(Widget, attr, value)
    _widget_attrs.clear()

def setup():
    setup_test_comm()

def teardown():
    teardown_test_comm()

def call_method(method, *args, **kwargs):
    method(*args, **kwargs)
