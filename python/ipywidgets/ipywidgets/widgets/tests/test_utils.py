# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..utils import deprecation

def test_deprecation():
    with pytest.deprecated_call() as w:
        deprecation('Deprecated call')
        # Make sure the deprecation pointed to the external function calling this test function
        assert w[0].filename.endswith('_pytest/python.py')

    with pytest.deprecated_call() as w:
        deprecation('Deprecated call', ['ipywidgets/widgets/tests'])
        # Make sure the deprecation pointed to the external function calling this test function
        assert w[0].filename.endswith('_pytest/python.py')
