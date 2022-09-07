
import inspect
from pathlib import Path
from unittest.mock import patch

import pytest

from ipywidgets.widgets.utils import deprecation
from ipywidgets.widgets.tests.utils import call_method


CALL_PATH = inspect.getfile(call_method)

@patch("ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL", [])
def test_deprecation_direct():
    with pytest.warns(DeprecationWarning) as record:
        deprecation("test message")
    assert len(record) == 1
    assert record[0].filename == __file__

@patch("ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL", [])
def test_deprecation_indirect():
    # If the line that calls "deprecation" is not internal, it is considered the source:
    with pytest.warns(DeprecationWarning) as record:
        call_method(deprecation, "test message")
    assert len(record) == 1
    assert record[0].filename == CALL_PATH

@patch("ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL", [CALL_PATH])
def test_deprecation_indirect_internal():
    # If the line that calls "deprecation" is internal, it is not considered the source:
    with pytest.warns(DeprecationWarning) as record:
        call_method(deprecation, "test message")
    assert len(record) == 1
    assert record[0].filename == __file__

@patch("ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL", [])
def test_deprecation_nested1():
    def level1():
        deprecation("test message")

    with pytest.warns(DeprecationWarning) as record:
        call_method(level1)

    assert len(record) == 1
    assert record[0].filename == __file__

@patch("ipywidgets.widgets.utils._IPYWIDGETS_INTERNAL", [])
def test_deprecation_nested2():
    def level2():
        deprecation("test message")
    def level1():
        level2()

    with pytest.warns(DeprecationWarning) as record:
        call_method(level1)

    assert len(record) == 1
    assert record[0].filename == __file__

