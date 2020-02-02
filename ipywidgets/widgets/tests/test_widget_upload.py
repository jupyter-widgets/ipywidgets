# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import datetime as dt
from unittest import TestCase

from traitlets import TraitError

from ipywidgets import FileUpload


FILE_UPLOAD_FRONTEND_CONTENT = {
    'name': 'file-name.txt',
    'type': 'text/plain',
    'size': 20760,
    'lastModified': 1578578296434,
    'error': '',
    'content': memoryview(b'file content'),
}


class TestFileUpload(TestCase):

    def test_construction(self):
        uploader = FileUpload()
        # Default
        assert uploader.accept == ''
        assert not uploader.multiple
        assert not uploader.disabled

    def test_construction_with_params(self):
        uploader = FileUpload(
            accept='.txt', multiple=True, disabled=True)
        assert uploader.accept == '.txt'
        assert uploader.multiple
        assert uploader.disabled

    def test_empty_initial_value(self):
        uploader = FileUpload()
        assert uploader.value == []

    def test_receive_single_file(self):
        uploader = FileUpload()
        message = {"value": [FILE_UPLOAD_FRONTEND_CONTENT]}
        uploader.set_state(message)
        assert len(uploader.value) == 1
        [uploaded_file] = uploader.value
        assert uploaded_file.name == 'file-name.txt'
        assert uploaded_file.type == 'text/plain'
        assert uploaded_file.size == 20760
        assert uploaded_file.content.tobytes() == b'file content'
        assert (
            uploaded_file.last_modified ==
            dt.datetime(2020, 1, 9, 13, 58, 16, 434000, tzinfo=dt.timezone.utc)
        )

    def test_receive_multiple_files(self):
        uploader = FileUpload(multiple=True)
        message = {
            "value": [
                FILE_UPLOAD_FRONTEND_CONTENT,
                {**FILE_UPLOAD_FRONTEND_CONTENT, **{'name': 'other-file-name.txt'}}
            ]
            }
        uploader.set_state(message)
        assert len(uploader.value) == 2
        assert uploader.value[0].name == 'file-name.txt'
        assert uploader.value[1].name == 'other-file-name.txt'
