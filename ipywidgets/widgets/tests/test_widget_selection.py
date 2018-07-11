# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import warnings

from unittest import TestCase

from traitlets import TraitError

from ipywidgets import Dropdown


class TestDropdown(TestCase):

    def test_construction(self):
        Dropdown()

    def test_deprecation_warning_mapping_options(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("module")
            Dropdown(options={'One': 1, 'Two': 2, 'Three': 3})
            assert len(w) == 1
            assert issubclass(w[-1].category, DeprecationWarning)
            assert "deprecated" in str(w[-1].message)


