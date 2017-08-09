# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ipython_genutils.py3compat import PY3

import nose.tools as nt

from traitlets import Bool, Tuple, List, Instance

from .utils import setup, teardown

from ..widget import Widget

#
# First some widgets to test on:
#

# A widget with simple traits (list + tuple to ensure both are handled)
class SimpleWidget(Widget):
    a = Bool().tag(sync=True)
    b = Tuple(Bool(), Bool(), Bool(), default_value=(False, False, False)).tag(sync=True)
    c = List(Bool()).tag(sync=True)



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
    d = Instance(DataInstance).tag(sync=True, to_json=mview_serializer, from_json=deserializer)

# A widget that has a buffer that might be changed on reception:
def truncate_deserializer(json_data, widget):
    return DataInstance( json_data['data'][:20].tobytes() if json_data else None )

class TruncateDataWidget(SimpleWidget):
    d = Instance(DataInstance).tag(sync=True, to_json=bytes_serializer, from_json=truncate_deserializer)


#
# Actual tests:
#

def test_set_state_simple():
    w = SimpleWidget()
    w.set_state(dict(
        a=True,
        b=[True, False, True],
        c=[False, True, False],
    ))

    nt.assert_equal(w.comm.messages, [])


def test_set_state_transformer():
    w = TransformerWidget()
    w.set_state(dict(
        d=[True, False, True]
    ))
    # Since the deserialize step changes the state, this should send an update
    nt.assert_equal(w.comm.messages, [((), dict(
        buffers=[],
        data=dict(
            buffer_paths=[],
            method='update',
            state=dict(d=[False, True, False])
        )))])


def test_set_state_data():
    w = DataWidget()
    data = memoryview(b'x'*30)
    w.set_state(dict(
        a=True,
        d={'data': data},
    ))
    nt.assert_equal(w.comm.messages, [])


def test_set_state_data_truncate():
    w = TruncateDataWidget()
    data = memoryview(b'x'*30)
    w.set_state(dict(
        a=True,
        d={'data': data},
    ))
    # Get message for checking
    nt.assert_equal(len(w.comm.messages), 1)   # ensure we didn't get more than expected
    msg = w.comm.messages[0]
    # Assert that the data update (truncation) sends an update
    buffers = msg[1].pop('buffers')
    nt.assert_equal(msg, ((), dict(
        data=dict(
            buffer_paths=[['d', 'data']],
            method='update',
            state=dict(d={})
        ))))

    # Sanity:
    nt.assert_equal(len(buffers), 1)
    nt.assert_equal(buffers[0], data[:20].tobytes())
