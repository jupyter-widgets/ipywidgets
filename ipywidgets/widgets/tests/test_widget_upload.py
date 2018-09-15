# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from unittest import TestCase

from traitlets import TraitError

from ipywidgets import FileUpload, MultiFileUpload


class TestFileUpload(TestCase):

    def test_construction(self):
        uploader = FileUpload()
        # Defaults
        assert uploader.accept == ''

    def test_construction_accept(self):
        uploader = FileUpload(accept='.txt')
        assert uploader.accept == '.txt'


class TestMultiFileUpload(TestCase):

    def test_construction(self):
        uploader = MultiFileUpload()
        # Defaults
        assert uploader.accept == ''
        assert uploader.multiple == True

    def test_construction_accept(self):
        uploader = MultiFileUpload(accept='.txt')
        assert uploader.accept == '.txt'

    def test_construction_multiple(self):
        uploader = MultiFileUpload(multiple=False)
        assert uploader.multiple == False
