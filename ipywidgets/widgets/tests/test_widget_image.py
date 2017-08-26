# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Image widget"""

import os

from ipywidgets import Image

import hashlib

import nose.tools as nt


# Data
LOGO_PNG = os.path.join(os.path.split(__file__)[0], 'data/jupyter-logo-transparent.png')
LOGO_PNG_DIGEST = '3ff9eafd7197083153e83339a72e7a335539bae189c33554c680e4382c98af02'


def test_empty_image():
    # Empty images shouldn't raise any errors
    Image()


def test_image_value():
    random_bytes = b'\x0ee\xca\x80\xcd\x9ak#\x7f\x07\x03\xa7'

    Image(value=random_bytes)


def test_image_format():
    Image(format='png')

    Image(format='jpeg')

    Image(format='url')


def test_from_filename():
    img = Image.from_filename(LOGO_PNG)

    assert_equal_hash(img.value, LOGO_PNG_DIGEST)


def test_set_from_filename():
    img = Image()
    img.value_from_filename(LOGO_PNG)

    assert_equal_hash(img.value, LOGO_PNG_DIGEST)


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
