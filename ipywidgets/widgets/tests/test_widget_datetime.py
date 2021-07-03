#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import datetime

import pytz
from traitlets import TraitError

from ..widget_datetime import DatetimePicker


def test_time_creation_blank():
    w = DatetimePicker()
    assert w.value is None


def test_time_creation_value():
    t = datetime.datetime.now(pytz.utc)
    w = DatetimePicker(value=t)
    assert w.value is t


def test_time_validate_value_none():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(1442, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(2056, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(value=t, min=t_min, max=t_max)
    w.value = None
    assert w.value is None


def test_time_validate_value_vs_min():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(2019, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(2056, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(min=t_min, max=t_max)
    w.value = t
    assert w.value.year == 2019


def test_time_validate_value_vs_max():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(1664, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(1994, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(min=t_min, max=t_max)
    w.value = t
    assert w.value.year == 1994


def test_time_validate_min_vs_value():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(2019, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(2056, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(value=t, max=t_max)
    w.min = t_min
    assert w.value.year == 2019


def test_time_validate_min_vs_max():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(2112, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(2056, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(value=t, max=t_max)
    with pytest.raises(TraitError):
        w.min = t_min


def test_time_validate_max_vs_value():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(1664, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(1994, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(value=t, min=t_min)
    w.max = t_max
    assert w.value.year == 1994


def test_time_validate_max_vs_min():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(1664, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(1337, 1, 1, tzinfo=pytz.utc)
    w = DatetimePicker(value=t, min=t_min)
    with pytest.raises(TraitError):
        w.max = t_max


def test_time_validate_naive():
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=pytz.utc)
    t_min = datetime.datetime(1442, 1, 1, tzinfo=pytz.utc)
    t_max = datetime.datetime(2056, 1, 1, tzinfo=pytz.utc)

    w = DatetimePicker(value=t, min=t_min, max=t_max)
    with pytest.raises(TraitError):
        w.max = t_max.replace(tzinfo=None)
    with pytest.raises(TraitError):
        w.min = t_min.replace(tzinfo=None)
    with pytest.raises(TraitError):
        w.value = t.replace(tzinfo=None)


def test_datetime_tzinfo():
    tz = pytz.timezone('Australia/Sydney')
    t = datetime.datetime(2002, 2, 20, 13, 37, 42, 7, tzinfo=tz)
    w = DatetimePicker(value=t)
    assert w.value == t
    # tzinfo only changes upon input from user
    assert w.value.tzinfo == tz
