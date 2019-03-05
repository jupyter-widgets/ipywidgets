"Testing widget layout templates"

from unittest import TestCase

import ipywidgets as widgets

class TestTemplates(TestCase):
    """test layout templates"""

    def test_merge_cells(self): #pylint: disable=no-self-use
        """test merging cells with missing widgets"""

        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.TwoByTwoLayout(top_left=button1,
                                top_right=button2,
                                bottom_left=button3,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                  '"bottom-left bottom-right"')
        assert box.top_left.layout.grid_area == 'top-left'
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.bottom_left.layout.grid_area == 'bottom-left'
        assert box.bottom_right.layout.grid_area == 'bottom-right'
        assert len(box.get_state()['children']) == 4

        box = widgets.TwoByTwoLayout(top_left=button1,
                                top_right=button2,
                                bottom_left=None,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                  '"top-left bottom-right"')
        assert box.top_left.layout.grid_area == 'top-left'
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.bottom_left is None
        assert box.bottom_right.layout.grid_area == 'bottom-right'
        assert len(box.get_state()['children']) == 3

        box = widgets.TwoByTwoLayout(top_left=None,
                                top_right=button2,
                                bottom_left=button3,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"bottom-left top-right"\n' +
                                                  '"bottom-left bottom-right"')
        assert box.top_left is None
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.bottom_left.layout.grid_area == 'bottom-left'
        assert box.bottom_right.layout.grid_area == 'bottom-right'
        assert len(box.get_state()['children']) == 3

        box = widgets.TwoByTwoLayout(top_left=None,
                                top_right=button2,
                                bottom_left=None,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"top-right top-right"\n' +
                                                  '"bottom-right bottom-right"')
        assert box.top_left is None
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.bottom_left is None
        assert box.bottom_right.layout.grid_area == 'bottom-right'
        assert len(box.get_state()['children']) == 2

        box = widgets.TwoByTwoLayout(top_left=button1,
                                top_right=None,
                                bottom_left=button3,
                                bottom_right=button4)

        assert box.layout.grid_template_areas == ('"top-left bottom-right"\n' +
                                                  '"bottom-left bottom-right"')
        assert box.top_left.layout.grid_area == 'top-left'
        assert box.top_right is None
        assert box.bottom_left.layout.grid_area == 'bottom-left'
        assert box.bottom_right.layout.grid_area == 'bottom-right'
        assert len(box.get_state()['children']) == 3


        box = widgets.TwoByTwoLayout(top_left=button1,
                                top_right=None,
                                bottom_left=None,
                                bottom_right=None)

        assert box.layout.grid_template_areas == ('"top-left top-left"\n' +
                                                  '"top-left top-left"')

        assert box.top_left is button1
        assert box.top_left.layout.grid_area == 'top-left'
        assert box.top_right is None
        assert box.bottom_left is None
        assert box.bottom_right is None
        assert len(box.get_state()['children']) == 1

        box = widgets.TwoByTwoLayout(top_left=None,
                                top_right=button1,
                                bottom_left=None,
                                bottom_right=None)

        assert box.layout.grid_template_areas == ('"top-right top-right"\n' +
                                                  '"top-right top-right"')

        assert box.top_right is button1
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.top_left is None
        assert box.bottom_left is None
        assert box.bottom_right is None
        assert len(box.get_state()['children']) == 1

        box = widgets.TwoByTwoLayout(top_left=None,
                                     top_right=None,
                                     bottom_left=None,
                                     bottom_right=None)

        assert box.layout.grid_template_areas is None
        assert box.top_left is None
        assert box.top_right is None
        assert box.bottom_left is None
        assert box.bottom_right is None
        assert not box.get_state()['children']

        box = widgets.TwoByTwoLayout(top_left=None,
                                     top_right=button1,
                                     bottom_left=None,
                                     bottom_right=None,
                                     merge=False)

        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                  '"bottom-left bottom-right"')

        assert box.top_right is button1
        assert box.top_right.layout.grid_area == 'top-right'
        assert box.top_left is None
        assert box.bottom_left is None
        assert box.bottom_right is None
        assert len(box.get_state()['children']) == 1


    def test_update_dynamically(self): #pylint: disable=no-self-use
        """test whether it's possible to add widget outside __init__"""

        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.TwoByTwoLayout(top_left=button1, top_right=button3,
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
