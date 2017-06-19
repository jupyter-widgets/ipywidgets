# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Widget."""

from IPython.utils.capture import capture_output
from IPython.display import display

from ..widget import Widget


def test_no_widget_view():
    with capture_output() as cap:
        w = Widget()
        display(w)
    assert len(cap.outputs) == 0
    assert len(cap.stdout) == 0
    assert len(cap.stderr) == 0
