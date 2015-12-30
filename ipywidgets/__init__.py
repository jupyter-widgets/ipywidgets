"""IPython widgets for Jupyter notebooks.

IPython Widgets provide simple interactive controls in the notebook.
Each Widget corresponds to an object in Python and Javascript,
with controls on the page.

To put a Widget on the page, you can display it with IPython's display machinery::

    from ipywidgets import IntSlider
    from IPython.display import display
    slider = IntSlider(min=1, max=10)
    display(slider)

Moving the slider will change the value. Most Widgets have a current value,
accessible as a `value` attribute.
"""

import os

from IPython import get_ipython
from ._version import version_info, __version__
from .widgets import *


def find_static_assets():
    """Return the path to static assets for widgets (js, css)"""
    here = os.path.abspath(__file__)
    return os.path.join(os.path.dirname(here), 'static')


def load_ipython_extension(ip):
    """Set up IPython to work with widgets"""
    if not hasattr(ip, 'kernel'):
        return
    register_comm_target(ip.kernel)


def register_comm_target(kernel=None):
    """Register the ipython.widget comm target"""
    if kernel is None:
        ip = get_ipython().kernel
    kernel.comm_manager.register_target('ipython.widget', Widget.handle_comm_opened)

# deprecated alias
handle_kernel = register_comm_target

def _handle_ipython():
    """register with the comm target at import if running in IPython"""
    ip = get_ipython()
    if ip is None:
        return
    load_ipython_extension(ip)

_handle_ipython()
