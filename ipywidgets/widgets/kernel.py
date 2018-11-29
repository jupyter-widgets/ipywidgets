# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Utils functions for retrieving IPython kernel and display logic.
This is helpful for other Python kernels like xeus-python, so that they can
mock `ipywidgets.kernel` module functions instead of mocking IPython and
ipykernel
"""

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
