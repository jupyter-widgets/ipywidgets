# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ..widget_string import Combobox, Text
import pytest


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

def test_deprecation_description_tooltip():
    with pytest.deprecated_call():
        Text(description_tooltip='tooltip')

    with pytest.deprecated_call():
        Text().description_tooltip


    with pytest.deprecated_call():
        Text().description_tooltip = 'tooltip'


def test_deprecation_on_submit():
    with pytest.deprecated_call():
        Text().on_submit(lambda *args: ...)
