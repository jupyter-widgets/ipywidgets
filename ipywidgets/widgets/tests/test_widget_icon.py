# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Icon widget"""

from ipywidgets import Icon, Button, ToggleButtons, ToggleButton
from .test_widget_image import get_logo_png, LOGO_PNG_DIGEST, assert_equal_hash


def test_icon_fontawesome():
    icon = Icon.fontawesome('home')
    assert icon.format == 'fontawesome'
    assert icon.value.decode('utf-8') == 'home'

def test_icon_filename():
    with get_logo_png() as LOGO_PNG:
        icon = Icon.from_file(LOGO_PNG)
        assert icon.format == 'png'
        assert_equal_hash(icon.value, LOGO_PNG_DIGEST)

def test_coerce_button():
    button = Button()
    button.icon is None

    # backwards compatible with a string value (which indicates a fontawesome icon)
    button = Button(icon='home')
    assert button.icon.value.decode('utf-8') == 'home'
    assert button.icon.format == 'fontawesome'

    # check if no copy is made
    button2 = Button(icon=button.icon)
    assert button2.icon is button.icon

def test_coerce_toggle_button():
    # backwards compatible with a string value (which indicates a fontawesome icon)
    button = ToggleButton(icon='home')
    assert button.icon.value.decode('utf-8') == 'home'
    assert button.icon.format == 'fontawesome'

    # check if no copy is made
    button2 = ToggleButton(icon=button.icon)
    assert button2.icon is button.icon

def test_coerce_toggle_buttons():
    icon1 = 'home'
    icon2 = Icon.fontawesome('refresh')
    buttons = ToggleButtons(values=[''] * 2, icons=[icon1, icon2])
    assert buttons.icons[0].value.decode('utf-8') == 'home'
    assert buttons.icons[0].format == 'fontawesome'
    assert buttons.icons[1].value.decode('utf-8') == 'refresh'
    assert buttons.icons[1].format == 'fontawesome'
    assert buttons.icons[1] is icon2


