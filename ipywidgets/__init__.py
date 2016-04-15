"""Interactive widgets for the Jupyter notebook.

Provide simple interactive controls in the notebook.
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
from ._version import version_info, __version__, __frontend_version__
from .widgets import *


def load_ipython_extension(ip):
    """Set up IPython to work with widgets"""
    if not hasattr(ip, 'kernel'):
        return
    register_comm_target(ip.kernel)


def register_comm_target(kernel=None):
    """Register the jupyter.widget comm target"""
    if kernel is None:
        kernel = get_ipython().kernel
    kernel.comm_manager.register_target('jupyter.widget', Widget.handle_comm_opened)
    kernel.comm_manager.register_target('jupyter.widget.version', handle_version_comm_opened)

# deprecated alias
handle_kernel = register_comm_target

def _handle_ipython():
    """Register with the comm target at import if running in IPython"""
    ip = get_ipython()
    if ip is None:
        return
    load_ipython_extension(ip)

_handle_ipython()


def find_static_assets():
    import warnings
    try:
        import widgetsnbextension
        if hasattr(widgetsnbextension, 'find_static_assets'):
            return widgetsnbextension.find_static_assets()
        else:
            warnings.warn("""The version of ipywidgets that you have installed
            only works with Jupyter Notebook 4.2 or later.  Your version of the
            Jupyter Notebook is too old. If you'd like to use ipywidgets with an
            older version of the notebook, use ipywidgets 4.x or earlier.
            """, RuntimeWarning)
            return []
    except ImportError:
        warnings.warn("""To use the widgets with your installed Jupyter Notebook
        version, please install ipywidgets 4.x or earlier.""", RuntimeWarning)
        return []
