# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from unittest import TestCase

from traitlets import TraitError

from ipywidgets import SelectionSlider, Select

class TestSelectionSlider(TestCase):

    def test_construction(self):
        SelectionSlider(options=['a', 'b', 'c'])

    def test_index_trigger(self):
        slider = SelectionSlider(options=['a', 'b', 'c'])
        observations = []
        def f(change):
            observations.append(change.new)
        slider.observe(f, 'index')
        assert slider.index == 0
        slider.options = [4, 5, 6]
        assert slider.index == 0
        assert slider.value == 4
        assert slider.label == '4'
        assert observations == [0]

class TestSelection(TestCase):

    def test_construction(self):
        select = Select(options=['a', 'b', 'c'])

    def test_index_trigger(self):
        select = Select(options=[1, 2, 3])
        observations = []
        def f(change):
            observations.append(change.new)
        select.observe(f, 'index')
        assert select.index == 0
        select.options = [4, 5, 6]
        assert select.index == 0
        assert select.value == 4
        assert select.label == '4'
        assert observations == [0]
