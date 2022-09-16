# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import inspect
import pytest
from ipywidgets import Button

PYTEST_PATH = inspect.getfile(pytest.Function)

def test_deprecation_fa_icons():
    with pytest.deprecated_call() as record:
        Button(icon='fa-home')
    assert len(record) == 1
    assert record[0].filename == PYTEST_PATH
