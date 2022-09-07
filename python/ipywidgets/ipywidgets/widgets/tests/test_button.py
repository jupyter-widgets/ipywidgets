# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest
from ipywidgets import Button

def test_deprecation_fa_icons():
    with pytest.deprecated_call():
        Button(icon='fa-home')
