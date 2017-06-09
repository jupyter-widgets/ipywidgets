# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test trait types of the widget packages."""
import array
import inspect
import datetime as dt
from weakref import ref

from unittest import TestCase
from traitlets import HasTraits, Undefined
from traitlets.tests.test_traitlets import TraitTestBase
from ipywidgets import Color
from ipywidgets.widgets.widget import _remove_buffers, _put_buffers
from ipywidgets.widgets.trait_types import date_serialization

from .test_eventful import CopyClass, event_form
from ..traits import EventfulElements, EventfulDict, EventfulList


class ColorTrait(HasTraits):

    value = Color("black")


class TestColor(TraitTestBase):

    obj = ColorTrait()

    _good_values = ["blue", "#AA0", "#FFFFFF"]
    _bad_values = ["vanilla", "blues"]


class TestDateSerialization(TestCase):

    def setUp(self):
        self.to_json = date_serialization['to_json']
        self.dummy_manager = None

    def test_serialize_none(self):
        self.assertIs(self.to_json(None, self.dummy_manager), None)

    def test_serialize_date(self):
        date = dt.date(1900, 2, 18)
        expected = {
            'year': 1900,
            'month': 1,
            'date': 18
        }
        self.assertEqual(self.to_json(date, self.dummy_manager), expected)


class TestDateDeserialization(TestCase):

    def setUp(self):
        self.from_json = date_serialization['from_json']
        self.dummy_manager = None

    def test_deserialize_none(self):
        self.assertIs(self.from_json(None, self.dummy_manager), None)

    def test_deserialize_date(self):
        serialized_date = {
            'year': 1900,
            'month': 1,
            'date': 18
        }
        expected = dt.date(1900, 2, 18)
        self.assertEqual(
            self.from_json(serialized_date, self.dummy_manager),
            expected
        )


class TestBuffers(TestCase):

    def test_remove_and_put_buffers(self):
        mv1 =  memoryview(b'test1')
        mv2 =  memoryview(b'test2')
        state = {'plain': [0, 'text'], # should not get removed
                 'x': {'ar': mv1}, # should result in an empty dict
                 'y': {'shape': (10, 10), 'data': mv1},
                 'z': (mv1, mv2), # tests tuple assigment
                 'top': mv1, # test a top level removal
                 'deep': {'a': 1, 'b':[0,{'deeper':mv2}]}} # deeply nested
        plain = state['plain']
        x = state['x']
        y = state['y']
        y_shape = y['shape']
        state_before = state
        state, buffer_paths, buffers = _remove_buffers(state)

        # check if buffers are removed
        self.assertIn('plain', state)
        self.assertIn('shape', state['y'])
        self.assertNotIn('ar', state['x'])
        self.assertEqual(state['x'], {})
        self.assertNotIn('data', state['y'])
        self.assertNotIn(mv1, state['z'])
        self.assertNotIn(mv1, state['z'])
        self.assertNotIn('top', state)
        self.assertIn('deep', state)
        self.assertIn('b', state['deep'])
        self.assertNotIn('deeper', state['deep']['b'][1])

        # check that items that didn't need change aren't touched
        self.assertIsNot(state, state_before)
        self.assertIs(state['plain'], plain)
        self.assertIsNot(state['x'], x)
        self.assertIsNot(state['y'], y)
        self.assertIs(state['y']['shape'], y_shape)

        # check that the buffer paths really point to the right buffer
        for path, buffer in [(['x', 'ar'], mv1), (['y', 'data'], mv1), (['z', 0], mv1), (['z', 1], mv2),\
                             (['top'], mv1), (['deep', 'b', 1, 'deeper'], mv2)]:
            self.assertIn(path, buffer_paths, "%r not in path" % path)
            index = buffer_paths.index(path)
            self.assertEqual(buffer, buffers[index])

        # and check that we can put it back together again
        _put_buffers(state, buffer_paths, buffers)
        # we know that tuples get converted to list, so help the comparison by changing the tuple to a list
        state_before['z'] = list(state_before['z'])
        self.assertEqual(state_before, state)


def compare_aggrigated_events(e1, e2):
    e1 = e1.thaw()
    e2 = e2.thaw()
    _e1 = e1.pop("event")
    _e2 = e2.pop("event")
    assert e1 == e2
    for x in _e1:
        assert _e1.count(x) == _e2.count(x)
    for x in _e2:
        assert _e1.count(x) == _e2.count(x)


class EventLogger(list):

    def __init__(self, test, value, etype):
        self.etype = etype
        # avoid circular reference
        # to self in the logger
        sref = ref(self)

        def logger(event):
            print(event)
            sref().append(event)

        self.owner = test.HasEventful()
        self.owner.value = value
        self.owner.observe(logger, "value", type=etype)

    def form(self, event=None, **data):
        return event_form(self.owner, "value", self.etype, event, **data)

    def compare(self, index, *events, **data):
        if events:
            compare_aggrigated_events(self[index], self.form(events))
        else:
            assert self[index] == self.form(**data)


class TestEventfulTraits(TestCase):

    trait = None

    def setUp(self):
        class HasEventful(HasTraits):
            if inspect.isclass(self.trait):
                value = self.trait()
            else:
                value = self.trait
        self.HasEventful = HasEventful

    def logged_value(self, value, etype):
        logger = EventLogger(self, value, etype)
        return logger, logger.owner.value


class TestEventfulElements(TestEventfulTraits):

    trait = EventfulElements

    def test_setting(self):
        log, value = self.logged_value({}, "setitem")

        value["a"] = 1
        assert value["a"] == 1
        value["a"] = 2
        assert value["a"] == 2

        assert len(log) == 2
        log.compare(0, key="a", old=Undefined, new=1)
        log.compare(1, key="a", old=1, new=2)

    def test_deleting(self):
        log, value = self.logged_value({}, "delitem")

        value["a"] = 2
        del value["a"]

        assert len(log) == 1
        log.compare(0, key="a", old=2)


class TestEventfulDictionary(TestEventfulTraits):

    trait = EventfulDict
    initializing_value = {}

    def test_setdefault(self):
        log, value = self.logged_value({}, "setitem")

        value.setdefault("a", 1)
        assert value == {"a": 1}
        value.setdefault("a", 2)
        assert value == {"a": 1}

        assert len(log) == 1
        log.compare(0, key="a", old=Undefined, new=1)

    def test_popping(self):
        log, value = self.logged_value(dict(a=1), "delitem")

        assert value.pop("a") == 1

        assert len(log) == 1
        log.compare(0, key="a", old=1)

    def test_updating(self):
        log, value = self.logged_value({}, "update")

        value.update(a=1)
        assert value == {"a": 1}
        value.update(a=2, b=1)
        assert value == {"a": 2, "b": 1}
        

        assert len(log) == 2
        log.compare(0, dict(key="a", old=Undefined, new=1))
        log.compare(1, dict(key="a", old=1, new=2), dict(key="b", old=Undefined, new=1))

    def test_clearing(self):
        log, value = self.logged_value(dict(a=1, b=1), "clear")

        value.clear()
        assert value == {}

        assert len(log) == 1
        log.compare(0, dict(key="a", old=1), dict(key="b", old=1))


class TestEventfulList(TestEventfulTraits):

    trait = EventfulList
    initializing_value = []

    def test_appending(self):
        log, value = self.logged_value([], "append")

        value.append(1)
        assert value == [1]
        value.append(2)
        assert value == [1, 2]

        assert len(log) == 2
        log.compare(0, key=0, new=1, old=Undefined)
        log.compare(1, key=1, new=2, old=Undefined)

    def test_extending(self):
        log, value = self.logged_value([], "extend")

        value.extend([1, 2])
        assert value == [1, 2]

        assert len(log) == 1
        log.compare(0, dict(key=0, new=1, old=Undefined), dict(key=1, new=2, old=Undefined))

    def test_removing(self):
        log, value = self.logged_value([1], "remove")

        value.remove(1)
        assert value == []

        assert len(log) == 1
        log.compare(0, key=0, old=1)

    def test_reversing(self):
        log, value = self.logged_value([1, 2, 3], "reverse")

        value.reverse()
        assert value == [3, 2, 1]

        assert len(log) == 1
        log.compare(0, old=[1, 2, 3], new=[3, 2, 1])

    def test_sorting(self):
        log, value = self.logged_value([1, 5, 4, 2], "sort")

        value.sort()
        assert value == [1, 2, 4, 5]

        assert len(log) == 1
        log.compare(0, old=[1, 5, 4, 2], new=[1, 2, 4, 5])

