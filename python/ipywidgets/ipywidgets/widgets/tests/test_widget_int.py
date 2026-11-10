# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from ..widget_int import IntText
from ..widget_string import TextStyle


def test_inttext_style():
    """IntText should support style like Text (issue #3639)."""
    w = IntText(style={'font_size': '30px'})
    assert isinstance(w.style, TextStyle)
    # Same frontend model as Text, so no new model needs registering.
    assert w.style._model_name == 'TextStyleModel'
    assert w.style.font_size == '30px'


def test_inttext_style_defaults():
    w = IntText()
    assert w.style.font_size is None
    assert w.style.background is None
    assert w.style.text_color is None


def test_inttext_style_set_after_creation():
    w = IntText()
    w.style = {'font_size': '30px', 'text_color': 'red'}
    assert w.style.font_size == '30px'
    assert w.style.text_color == 'red'


def test_inttext_style_description_width_still_works():
    # description_width comes from the base DescriptionStyle.
    w = IntText(style={'description_width': '100px'})
    assert w.style.description_width == '100px'
