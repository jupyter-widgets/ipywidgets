# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test trait types of the widget packages."""
import array
import datetime as dt

import nose.tools as nt

from unittest import TestCase
from traitlets import HasTraits, Int, TraitError
from traitlets.tests.test_traitlets import TraitTestBase

from ipywidgets import Color, NumberFormat
from ipywidgets.widgets.trait_types import date_serialization, TypedTuple


class NumberFormatTrait(HasTraits):
    value = NumberFormat(".3f")


class TestNumberFormat(TraitTestBase):
    obj = NumberFormatTrait()

    _good_values = [
        '.2f', '.0%', '($.2f', '+20', '.^20', '.2s', '#x', ',.2r',
        ' .2f', '.2', ''
    ]
    _bad_values = [52, False, 'broken', '..2f', '.2a']


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


def test_typed_tuple_uninitialized_ints():
    class TestCase(HasTraits):
        value = TypedTuple(trait=Int())

    obj = TestCase()
    assert obj.value == ()


def test_typed_tuple_init_ints():
    class TestCase(HasTraits):
        value = TypedTuple(trait=Int())

    obj = TestCase(value=(1, 2, 3))
    assert obj.value == (1, 2, 3)


def test_typed_tuple_set_ints():
    class TestCase(HasTraits):
        value = TypedTuple(trait=Int())

    obj = TestCase()
    obj.value = (1, 2, 3)
    assert obj.value == (1, 2, 3)


def test_typed_tuple_default():
    class TestCase(HasTraits):
        value = TypedTuple(default_value=(1, 2, 3))

    obj = TestCase()
    assert obj.value == (1, 2, 3)


def test_typed_tuple_mixed_default():
    class TestCase(HasTraits):
        value = TypedTuple(default_value=(1, 2, 'foobar'))

    obj = TestCase()
    assert obj.value == (1, 2, 'foobar')


def test_typed_tuple_bad_default():
    class TestCase(HasTraits):
        value = TypedTuple(trait=Int(), default_value=(1, 2, 'foobar'))


    with nt.assert_raises(TraitError):
        obj = TestCase()
        a = obj.value   # a read might be needed to trigger default validation


def test_typed_tuple_bad_set():
    class TestCase(HasTraits):
        value = TypedTuple(trait=Int())

    obj = TestCase()
    with nt.assert_raises(TraitError):
        obj.value = (1, 2, 'foobar')


def test_typed_tuple_positional_trait():
    class TestCase(HasTraits):
        value = TypedTuple(Int())

    obj = TestCase(value=(1, 2, 3))
    assert obj.value == (1, 2, 3)


def test_typed_tuple_positional_default():
    class TestCase(HasTraits):
        value = TypedTuple((1, 2, 3))

    obj = TestCase()
    assert obj.value == (1, 2, 3)
