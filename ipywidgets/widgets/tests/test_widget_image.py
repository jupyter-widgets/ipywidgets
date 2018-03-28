# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Image widget"""

import os

from ipywidgets import Image

import hashlib

import nose.tools as nt

import pkgutil

import tempfile
from contextlib import contextmanager

# Data
@contextmanager
def get_logo_png():
    # Once the tests are not in the package, this context manager can be
    # replaced with the location of the actual file
    LOGO_DATA = pkgutil.get_data('ipywidgets.widgets.tests',
                                 'data/jupyter-logo-transparent.png')
    handle, fname = tempfile.mkstemp()
    os.close(handle)
    with open(fname, 'wb') as f:
        f.write(LOGO_DATA)

    yield fname

    os.remove(fname)

LOGO_PNG_DIGEST = '3ff9eafd7197083153e83339a72e7a335539bae189c33554c680e4382c98af02'


def test_empty_image():
    # Empty images shouldn't raise any errors
    Image()


def test_image_value():
    random_bytes = b'\x0ee\xca\x80\xcd\x9ak#\x7f\x07\x03\xa7'

    Image(value=random_bytes)


def test_image_format():
    # Test that these format names don't throw an error
    Image(format='png')

    Image(format='jpeg')

    Image(format='url')


def test_from_filename():
    with get_logo_png() as LOGO_PNG:
        img = Image.from_file(LOGO_PNG)

        assert_equal_hash(img.value, LOGO_PNG_DIGEST)


def test_set_from_filename():
    img = Image()
    with get_logo_png() as LOGO_PNG:
        img.set_value_from_file(LOGO_PNG)

        assert_equal_hash(img.value, LOGO_PNG_DIGEST)


def test_from_file():
    with get_logo_png() as LOGO_PNG:
        with open(LOGO_PNG, 'rb') as f:
            img = Image.from_file(f)
            assert_equal_hash(img.value, LOGO_PNG_DIGEST)


def test_set_value_from_file():
    img = Image()
    with get_logo_png() as LOGO_PNG:
        with open(LOGO_PNG, 'rb') as f:
            img.set_value_from_file(f)
            assert_equal_hash(img.value, LOGO_PNG_DIGEST)


def test_from_url_unicode():
    img = Image.from_url(u'https://jupyter.org/assets/main-logo.svg')
    assert img.value == b'https://jupyter.org/assets/main-logo.svg'


def test_from_url_bytes():
    img = Image.from_url(b'https://jupyter.org/assets/main-logo.svg')

    assert img.value == b'https://jupyter.org/assets/main-logo.svg'


# Helper functions
def get_hash_hex(byte_str):
    m = hashlib.new('sha256')

    m.update(byte_str)

    return m.hexdigest()


def assert_equal_hash(byte_str, digest, msg=None):
    kwargs = {}
    if msg is not None:
        kwargs['msg'] = msg

    nt.eq_(get_hash_hex(byte_str), digest, **kwargs)
