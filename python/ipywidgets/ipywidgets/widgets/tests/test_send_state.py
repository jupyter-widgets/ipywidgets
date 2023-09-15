# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .utils import setup, teardown, DummyComm, SimpleWidget, NumberWidget

from ..widget import Widget

from ..._version import __control_protocol_version__


def test_empty_send_state():
    w = SimpleWidget()
    w.send_state([])
    assert w.comm.messages == []


def test_empty_hold_sync():
    w = SimpleWidget()
    with w.hold_sync():
        pass
    assert w.comm.messages == []

def test_control():
    comm = DummyComm()
    Widget.close_all()
    w = SimpleWidget()
    Widget.handle_control_comm_opened(
        comm, dict(metadata={'version': __control_protocol_version__})
    )
    Widget._handle_control_comm_msg(dict(content=dict(
        data={'method': 'request_states'}
    )))
    assert comm.messages

def test_control_filter():
    comm = DummyComm()
    random_widget = SimpleWidget()
    random_widget.open()
    random_widget_id = random_widget.model_id
    important_widget = NumberWidget()
    important_widget.open()
    important_widget_id = important_widget.model_id
    Widget.handle_control_comm_opened(
        comm, dict(metadata={'version': __control_protocol_version__})
    )
    Widget._handle_control_comm_msg(dict(content=dict(
        data={'method': 'request_states', 'widget_id': important_widget_id}
    )))
    # comm.messages have very complicated nested structure, we just want to verify correct widget is included
    assert important_widget_id in str(comm.messages[0])
    # And widget not supposed to be there is filtered off
    assert random_widget_id not in str(comm.messages[0])

    # Negative case (should contain all states)
    Widget._handle_control_comm_msg(dict(content=dict(
        data={'method': 'request_states'}
    )))
    assert important_widget_id in str(comm.messages[1])
    assert random_widget_id in str(comm.messages[1])

    # Invalid case (widget either already closed or does not exist)
    Widget._handle_control_comm_msg(dict(content=dict(
        data={'method': 'request_states', 'widget_id': 'no_such_widget'}
    )))
    # Should not contain any iPyWidget information in the states
    assert not comm.messages[2][0][0]['states']

