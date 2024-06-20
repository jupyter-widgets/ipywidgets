# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ipywidgets import Widget
from traitlets import Bool, Tuple, List, Instance, CFloat, CInt, Float, Int

import ipywidgets.widgets.widget
import uuid

# The new comm package is not available in our Python 3.7 CI (older ipykernel version)
try:
    import comm
    NEW_COMM_PACKAGE = True
except ImportError:
    NEW_COMM_PACKAGE = False

import ipykernel.comm


class DummyComm():
    kernel = 'Truthy'

    def __init__(self, *args, **kwargs):
        super().__init__()
        self.comm_id = uuid.uuid4().hex
        self.messages = []

    def open(self, *args, **kwargs):
        pass

    def on_msg(self, *args, **kwargs):
        pass

    def send(self, *args, **kwargs):
        self.messages.append((args, kwargs))

    def close(self, *args, **kwargs):
        pass


def dummy_create_comm(**kwargs):
    return DummyComm()


def dummy_get_comm_manager(**kwargs):
    return {}


_widget_attrs = {}
undefined = object()

if NEW_COMM_PACKAGE:
    orig_comm = ipykernel.comm.comm.BaseComm
else:
    orig_comm = ipykernel.comm.Comm
orig_create_comm = None
orig_get_comm_manager = None

if NEW_COMM_PACKAGE:
    orig_create_comm = comm.create_comm
    orig_get_comm_manager = comm.get_comm_manager

def setup_test_comm():
    if NEW_COMM_PACKAGE:
        comm.create_comm = dummy_create_comm
        comm.get_comm_manager = dummy_get_comm_manager
        ipykernel.comm.comm.BaseComm = DummyComm
    else:
        ipykernel.comm.Comm = DummyComm
    Widget.comm.klass = DummyComm
    ipywidgets.widgets.widget.Comm = DummyComm
    _widget_attrs['_repr_mimebundle_'] = Widget._repr_mimebundle_
    def raise_not_implemented(*args, **kwargs):
        raise NotImplementedError()
    Widget._repr_mimebundle_ = raise_not_implemented

def teardown_test_comm():
    if NEW_COMM_PACKAGE:
        comm.create_comm = orig_create_comm
        comm.get_comm_manager = orig_get_comm_manager
        ipykernel.comm.comm.BaseComm = orig_comm
    else:
        ipykernel.comm.Comm = orig_comm
    Widget.comm.klass = orig_comm
    ipywidgets.widgets.widget.Comm = orig_comm
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


# A widget with simple traits (list + tuple to ensure both are handled)
class SimpleWidget(Widget):
    a = Bool().tag(sync=True)
    b = Tuple(Bool(), Bool(), Bool(), default_value=(False, False, False)).tag(sync=True)
    c = List(Bool()).tag(sync=True)


# A widget with various kinds of number traits
class NumberWidget(Widget):
    f = Float().tag(sync=True)
    cf = CFloat().tag(sync=True)
    i = Int().tag(sync=True)
    ci = CInt().tag(sync=True)



# A widget where the data might be changed on reception:
def transform_fromjson(data, widget):
    # Switch the two last elements when setting from json, if the first element is True
    # and always set first element to False
    if not data[0]:
        return data
    return [False] + data[1:-2] + [data[-1], data[-2]]

class TransformerWidget(Widget):
    d = List(Bool()).tag(sync=True, from_json=transform_fromjson)


# A widget that has a buffer:
class DataInstance():
    def __init__(self, data=None):
        self.data = data

def mview_serializer(instance, widget):
    return { 'data': memoryview(instance.data) if instance.data else None }

def bytes_serializer(instance, widget):
    return { 'data': bytearray(memoryview(instance.data).tobytes()) if instance.data else None }

def deserializer(json_data, widget):
    return DataInstance( memoryview(json_data['data']).tobytes() if json_data else None )

class DataWidget(SimpleWidget):
    d = Instance(DataInstance, args=()).tag(sync=True, to_json=mview_serializer, from_json=deserializer)

# A widget that has a buffer that might be changed on reception:
def truncate_deserializer(json_data, widget):
    return DataInstance( json_data['data'][:20].tobytes() if json_data else None )

class TruncateDataWidget(SimpleWidget):
    d = Instance(DataInstance, args=()).tag(sync=True, to_json=bytes_serializer, from_json=truncate_deserializer)
