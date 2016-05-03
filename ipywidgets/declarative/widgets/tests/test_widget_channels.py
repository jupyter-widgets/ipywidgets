# (c) Copyright Jupyter Development Team
# (c) Copyright IBM Corp. 2015

""" Tests for the widget_channels.py module """

import unittest

try:
    from unittest.mock import Mock
except ImportError as e:
    from mock import Mock

from ipykernel.comm import Comm
from ..widget_channels import *


class TestWidgetChannels(unittest.TestCase):

    def setUp(self):
        comm = Mock(spec=Comm)
        self.widget = Channels(comm=comm)

        self.chan = 'c'
        self.name = 'x'

        self.msg = {
            'event': 'change',
            'data': {
                'channel': self.chan,
                'name': self.name,
                'old_val': 1,
                'new_val': 2
            }
        }

        self.lst = []
        self.handler = lambda x, y: self.lst.extend([x, y])

    #### watch()
    def test_watch(self):
        """should execute a registered handler with arguments from message"""
        self.widget.watch(self.name, self.handler, self.chan)
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [1, 2])

    def test_watch_bad_channel(self):
        """should not execute a handler given an unregistered channel"""
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [])

    def test_watch_bad_name(self):
        """should not execute a handler given an unregistered name"""
        self.widget.watch("bad name", self.handler, self.chan)
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [])

    def test_watch_array(self):
        """should execute a handler given an array type"""
        self.widget.watch(self.name, self.handler, self.chan)
        self.msg['data']['old_val'] = [1, 2]
        self.msg['data']['new_val'] = [3, 4]
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [[1, 2], [3, 4]])

    def test_watch_dict(self):
        """should execute a handler given an dict type"""
        self.widget.watch(self.name, self.handler, self.chan)
        self.msg['data']['old_val'] = {"a": 1}
        self.msg['data']['new_val'] = {"b": "c"}
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [{"a": 1}, {"b": "c"}])

    #### _handle_change_msg()
    def test_handle_change_msg_invoke_error(self):
        """should send an error message when handler invocation fails"""
        self.widget.error = lambda msg: self.lst.append('err')
        explosion = lambda x, y: 1 / 0
        self.widget.watch(self.name, explosion, self.chan)
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, ['err'])

    def test_hand_change_msg_invoke_success(self):
        """should send an ok message when handler invocation succeeds"""
        self.widget.ok = lambda: self.lst.append('ok')
        self.widget.watch(self.name, self.handler, self.chan)
        self.widget._handle_change_msg(None, self.msg, None)
        self.assertEqual(self.lst, [1, 2, 'ok'])

