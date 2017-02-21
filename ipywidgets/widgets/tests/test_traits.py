# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test trait types of the widget packages."""

from unittest import TestCase
from traitlets import HasTraits
from traitlets.tests.test_traitlets import TraitTestBase
from ipywidgets import Color


class ColorTrait(HasTraits):
    value = Color("black")


class TestColor(TraitTestBase):
    obj = ColorTrait()

    _good_values = ["blue", "#AA0", "#FFFFFF"]
    _bad_values = ["vanilla", "blues"]

