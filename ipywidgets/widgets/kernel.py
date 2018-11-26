# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Utils functions for retrieving IPython kernel and display logic."""

from ipykernel.comm import Comm
from IPython import get_ipython
from IPython.display import display, clear_output

def mock_register(*args, **kwargs):
    pass

ipython = get_ipython()
if (ipython is not None and hasattr(ipython, "kernel")):
    register_target = get_ipython().kernel.comm_manager.register_target
else:
    register_target = mock_register

get_kernel = get_ipython
