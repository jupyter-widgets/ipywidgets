# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test trait types of the widget packages."""
import array

from unittest import TestCase
from traitlets import HasTraits
from traitlets.tests.test_traitlets import TraitTestBase
from ipywidgets import Color
from ipywidgets.widgets import _split_state_buffers


class ColorTrait(HasTraits):
    value = Color("black")


class TestColor(TraitTestBase):
    obj = ColorTrait()

    _good_values = ["blue", "#AA0", "#FFFFFF"]
    _bad_values = ["vanilla", "blues"]


class TestBuffers(TestCase):
    def test_state_with_buffers(self):
        ar1 = array.array('d', [1.0, 2.0, 3.14])
        ar2 = array.array('d', [1.0, 2.0, 3.14])
        mv1 =  memoryview(ar1)
        mv2 =  memoryview(ar2)
        state = {'plain': [0, 'text'], 'x': {'ar': mv1}, 'y': {'shape': (10, 10), 'data': mv1}, 'z': [mv1, mv2]}
        state, state_with_buffers, buffer_paths, buffers = _split_state_buffers(state)
        print("executed", state, state_with_buffers, buffer_paths, buffers)
        self.assertIn('plain', state)
        self.assertNotIn('x', state)
        self.assertNotIn('y', state)
        self.assertNotIn('z', state)
        for path, buffer in [(['x', 'ar'], mv1), (['y', 'data'], mv2), (['z', 0], mv1), (['z', 1], mv2)]:
            self.assertIn(path, buffer_paths, "%r not in path" % path)
            index = buffer_paths.index(path)
            self.assertEqual(buffer, buffers[index])
