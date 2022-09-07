# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from unittest.mock import patch
import pytest

import ipywidgets as widgets


@patch(
    "ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL",
    ['widgets/widget.py', 'widgets/widget_button.py']
)
def test_fa_prefix_deprecation():
    with pytest.deprecated_call() as record:
        widgets.Button(icon="fa-gear")
    assert len(record) == 1
    assert record[0].filename == __file__
