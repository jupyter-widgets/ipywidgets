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


# Workaround for the absence of a comm_info_[request/reply] shell message
class CommInfo(Widget):
    """CommInfo widgets are is typically instantiated by the front-end.

    As soon as it is instantiated, it sends the collection of valid comms, and
    kills itself. It is a workaround to the absence of comm_info shell
    message.
    """

    def __init__(self, **kwargs):
        super(CommInfo, self).__init__(**kwargs)
        target_name = 'ipython.widget'
        comms = {
            k: dict(target_name=v.target_name)
            for (k, v) in self.comm.kernel.comm_manager.comms.items()
            if v is not self.comm and (v.target_name == target_name or target_name is None)
        }
        self.send(dict(comms=comms))
        self.close()
