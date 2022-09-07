# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ..widget_string import Combobox, Text
from unittest.mock import patch
import pytest


@patch(
    "ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL",
    ['widgets/widget_string.py']
)
def test_on_submit_deprecation():
    w = Text()
    with pytest.deprecated_call() as record:
        w.on_submit(lambda: None)
    assert len(record) == 1
    assert record[0].filename == __file__


@patch(
    "ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL",
    ['widgets/widget_string.py', 'widgets/widget_description.py']
)
def test_tooltip_deprecation():
    with pytest.deprecated_call() as record:
        w = Text(description_tooltip="testing")
    assert len(record) == 1
    assert record[0].filename == __file__

    with pytest.deprecated_call() as record:
        assert w.description_tooltip == "testing"
    assert len(record) == 1
    assert record[0].filename == __file__

    with pytest.deprecated_call() as record:
        w.description_tooltip = "second value"
    assert len(record) == 1
    assert record[0].filename == __file__
    assert w.tooltip == "second value"


def test_combobox_creation_blank():
    w = Combobox()
    assert w.value == ''
    assert w.options == ()
    assert w.ensure_option == False


def test_combobox_creation_kwargs():
    w = Combobox(
        value='Chocolate',
        options=[
            "Chocolate",
            "Coconut",
            "Mint",
            "Strawberry",
            "Vanilla",
        ],
        ensure_option=True
    )
    assert w.value == 'Chocolate'
    assert w.options == (
            "Chocolate",
            "Coconut",
            "Mint",
            "Strawberry",
            "Vanilla",
        )
    assert w.ensure_option == True
