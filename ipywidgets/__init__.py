from .widgets import *
from IPython import get_ipython

# Register a comm target for Javascript initialized widgets..
def handle_kernel(kernel):
    kernel.comm_manager.register_target('ipython.widget', Widget.handle_comm_opened)
try:
	handle_kernel(get_ipython().kernel)
except:
	pass # Nom nom nom

# Return the static assets path.
def find_static_assets():
    import os
    path = os.path.abspath(__file__)
    return os.path.join(os.path.dirname(path), 'static')
