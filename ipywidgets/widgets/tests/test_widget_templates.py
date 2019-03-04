from unittest import TestCase

from traitlets import TraitError

import ipywidgets as widgets


class TestTemplates(TestCase):

    def test_update_dynamically(self):

        button1 = widgets.Button()
        button2 = widgets.Button()

        box = widgets.AppLayout(top_left=button1)

        state = box.get_state()
        assert len(state['children']) == 3
        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                   '"top-left bottom-right"')
        layout_old = state['layout']
        box.bottom_left = button2

        state = box.get_state()
        assert len(state['children']) == 4
        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                   '"bottom-left bottom-right"')
        assert layout_old != state['layout']
