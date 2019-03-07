"Testing widget layout templates"

from unittest import TestCase

import ipywidgets as widgets
from ipywidgets.widgets.widget_templates import LayoutTemplate

class TestTwoByTwoLayout(TestCase):
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

    def test_keep_layout_options(self): #pylint: disable=no-self-use
        """test whether layout options are passed down to GridBox"""

        layout = widgets.Layout(align_items="center")
        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.TwoByTwoLayout(top_left=button1, top_right=button2,
                                     bottom_left=button3, bottom_right=button4,
                                     layout=layout)

        assert box.layout.align_items == 'center'

    def test_pass_layout_options(self): #pylint: disable=no-self-use
        """test whether the extra layout options of the template class are
           passed down to Layout object"""

        button1 = widgets.Button()
        button2 = widgets.Button()
        button3 = widgets.Button()
        button4 = widgets.Button()

        box = widgets.TwoByTwoLayout(top_left=button1, top_right=button2,
                                     bottom_left=button3, bottom_right=button4,
                                     grid_gap="10px", justify_content="center",
                                     align_items="center")

        assert box.layout.grid_gap == "10px"
        assert box.layout.justify_content == "center"
        assert box.layout.align_items == "center"

        # we still should be able to pass them through layout
        layout = widgets.Layout(grid_gap="10px", justify_content="center",
                                align_items="center")
        box = widgets.TwoByTwoLayout(top_left=button1, top_right=button2,
                                     bottom_left=button3, bottom_right=button4,
                                     layout=layout
                                     )

        assert box.layout.grid_gap == "10px"
        assert box.layout.justify_content == "center"
        assert box.layout.align_items == "center"

        # values passed directly in the constructor should overwite layout options
        layout = widgets.Layout(grid_gap="10px", justify_content="center",
                                align_items="center")
        box = widgets.TwoByTwoLayout(top_left=button1, top_right=button2,
                                     bottom_left=button3, bottom_right=button4,
                                     layout=layout, grid_gap="30px"
                                     )

        assert box.layout.grid_gap == "30px"
        assert box.layout.justify_content == "center"
        assert box.layout.align_items == "center"


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
        box.bottom_left = button2

        state = box.get_state()
        assert len(state['children']) == 4
        assert box.layout.grid_template_areas == ('"top-left top-right"\n' +
                                                  '"bottom-left bottom-right"')

class TestAppLayout(TestCase):
    """test layout templates"""

    def test_create_with_defaults(self):
        "test creating with default values"

        footer = widgets.Button()
        header = widgets.Button()
        center = widgets.Button()
        left_sidebar = widgets.Button()
        right_sidebar = widgets.Button()

        box = widgets.AppLayout(
            footer=footer,
            header=header,
            center=center,
            left_sidebar=left_sidebar,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"left-sidebar center right-sidebar"\n' +
                                                  '"footer footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'

        assert len(box.get_state()['children']) == 5

        # empty layout should produce no effects

        box = widgets.AppLayout()
        assert box.layout.grid_template_areas is None
        assert box.layout.grid_template_columns is None
        assert box.layout.grid_template_rows is None
        assert len(box.get_state()['children']) == 0


    def test_merge_empty_cells(self):
        "test if cells are correctly merged"

        footer = widgets.Button()
        header = widgets.Button()
        center = widgets.Button()
        left_sidebar = widgets.Button()
        right_sidebar = widgets.Button()

        # merge all if only one widget
        box = widgets.AppLayout(
            center=center
        )

        assert box.layout.grid_template_areas == ('"center center center"\n' +
                                                  '"center center center"\n' +
                                                  '"center center center"')
        assert box.center.layout.grid_area == 'center'

        assert len(box.get_state()['children']) == 1

        box = widgets.AppLayout(
            left_sidebar=left_sidebar
        )

        assert box.layout.grid_template_areas == ('"left-sidebar left-sidebar left-sidebar"\n' +
                                                  '"left-sidebar left-sidebar left-sidebar"\n' +
                                                  '"left-sidebar left-sidebar left-sidebar"')
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'

        assert len(box.get_state()['children']) == 1

        # merge left and right sidebars with center

        box = widgets.AppLayout(
            header=header,
            footer=footer,
            left_sidebar=left_sidebar,
            center=center
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"left-sidebar center center"\n' +
                                                  '"footer footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert len(box.get_state()['children']) == 4

        box = widgets.AppLayout(
            header=header,
            footer=footer,
            right_sidebar=right_sidebar,
            center=center
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"center center right-sidebar"\n' +
                                                  '"footer footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center.layout.grid_area == 'center'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert len(box.get_state()['children']) == 4

        box = widgets.AppLayout(
            header=header,
            footer=footer,
            center=center
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"center center center"\n' +
                                                  '"footer footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center.layout.grid_area == 'center'
        assert len(box.get_state()['children']) == 3

        # if only center missing, remove it from view
        box = widgets.AppLayout(
            header=header,
            footer=footer,
            center=None,
            left_sidebar=left_sidebar,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == ('"header header"\n' +
                                                  '"left-sidebar right-sidebar"\n' +
                                                  '"footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert box.center is None
        assert len(box.get_state()['children']) == 4

        # center and one sidebar missing -> 3 row arrangement
        box = widgets.AppLayout(
            header=header,
            footer=footer,
            center=None,
            left_sidebar=None,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == ('"header header"\n' +
                                                  '"right-sidebar right-sidebar"\n' +
                                                  '"footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.left_sidebar is None
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert box.center is None
        assert len(box.get_state()['children']) == 3


        # remove middle row is both sidebars and center missing
        box = widgets.AppLayout(
            header=header,
            footer=footer,
            center=None,
            left_sidebar=None,
            right_sidebar=None
        )

        assert box.layout.grid_template_areas == ('"header"\n' +
                                                  '"footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center is None
        assert box.left_sidebar is None
        assert box.right_sidebar is None
        assert len(box.get_state()['children']) == 2



        # do not merge if merge=False
        box = widgets.AppLayout(
            header=header,
            footer=footer,
            center=center,
            merge=False
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"left-sidebar center right-sidebar"\n' +
                                                  '"footer footer footer"')
        assert box.footer.layout.grid_area == 'footer'
        assert box.header.layout.grid_area == 'header'
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar is None
        assert box.right_sidebar is None
        assert len(box.get_state()['children']) == 3

        # merge header and footer simply removes it from view
        box = widgets.AppLayout(
            footer=footer,
            center=center,
            left_sidebar=left_sidebar,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == ('"left-sidebar center right-sidebar"\n' +
                                                  '"footer footer footer"')
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert box.footer.layout.grid_area == 'footer'
        assert box.header is None
        assert len(box.get_state()['children']) == 4

        box = widgets.AppLayout(
            header=header,
            center=center,
            left_sidebar=left_sidebar,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == ('"header header header"\n' +
                                                  '"left-sidebar center right-sidebar"')
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert box.header.layout.grid_area == 'header'
        assert box.footer is None
        assert len(box.get_state()['children']) == 4

        box = widgets.AppLayout(
            center=center,
            left_sidebar=left_sidebar,
            right_sidebar=right_sidebar
        )

        assert box.layout.grid_template_areas == '"left-sidebar center right-sidebar"'
        assert box.center.layout.grid_area == 'center'
        assert box.left_sidebar.layout.grid_area == 'left-sidebar'
        assert box.right_sidebar.layout.grid_area == 'right-sidebar'
        assert box.footer is None
        assert box.header is None
        assert len(box.get_state()['children']) == 3

        # merge all if only one widget
        box = widgets.AppLayout(
            center=center
        )

        assert box.layout.grid_template_areas == ('"center center center"\n' +
                                                  '"center center center"\n' +
                                                  '"center center center"')
        assert box.center.layout.grid_area == 'center'

        assert len(box.get_state()['children']) == 1

class TestLayoutTemplate(TestCase):
    """test mixin with layout properties"""
    
    class DummyTemplate(LayoutTemplate):
        layout = widgets.Layout()

    def test_layout_updated_on_trait_change(self):
        "test whether respective layout traits are updated when traits change"

        template = self.DummyTemplate(width="100%")
        assert template.width == '100%'
        assert template.layout.width == '100%'

        template.width = 'auto'
        assert template.width == 'auto'
        assert template.layout.width == 'auto'
