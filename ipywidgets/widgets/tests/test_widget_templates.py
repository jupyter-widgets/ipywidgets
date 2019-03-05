from unittest import TestCase

from traitlets import TraitError

import ipywidgets as widgets


class TestTemplates(TestCase):

    def test_merge_cells(self):
        """test merging cells with missing widgets"""

        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.AppLayout(top_left=button1,
                                top_right=button2,
                                bottom_left=button3,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                  '"bottom-left bottom-right"')
        assert box.top_left.layout.grid_area == 'top-left'
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.bottom_left.layout.grid_area == 'bottom-left'
        assert box.bottom_right.layout.grid_area == 'bottom-right'


    def test_update_dynamically(self):
        """test whether it's possible to add widget outside __init__"""

        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.AppLayout(top_left=button1, top_right=button3,
                                bottom_left=None, bottom_right=button4)

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
