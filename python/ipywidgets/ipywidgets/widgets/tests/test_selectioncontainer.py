# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from unittest import TestCase

from traitlets import TraitError

from ipywidgets.widgets import Accordion, HTML


class TestAccordion(TestCase):

    def setUp(self):
        self.children = [HTML('0'), HTML('1')]

    def test_selected_index_none(self):
        accordion = Accordion(self.children, selected_index=None)
        state = accordion.get_state()
        assert state['selected_index'] is None

    def test_selected_index(self):
        accordion = Accordion(self.children, selected_index=1)
        state = accordion.get_state()
        assert state['selected_index'] == 1

    def test_selected_index_out_of_bounds(self):
        with self.assertRaises(TraitError):
            Accordion(self.children, selected_index=-1)


    def test_titles(self):
        accordion = Accordion(self.children, selected_index=None)
        assert accordion.get_state()['titles'] == ('', '')
        assert accordion.titles == ('', '')

        accordion.set_title(1, 'Title 1')
        assert accordion.get_state()['titles'] == ('', 'Title 1')
        assert accordion.titles[1] == 'Title 1'
        assert accordion.get_title(1) == 'Title 1'

        # Backwards compatible with 7.x api
        accordion.set_title(1, None)
        assert accordion.get_state()['titles'] == ('', '')
        assert accordion.titles[1] == ''
        assert accordion.get_title(1) == ''

        with self.assertRaises(IndexError):
            accordion.set_title(2, 'out of bounds')
        with self.assertRaises(IndexError):
            accordion.get_title(2)

        accordion.children = tuple(accordion.children[:1])
        assert len(accordion.children) == 1
        assert accordion.titles == ('',)
