from .widgets import *

# Register comm target for Javascript initialized widgets..
ip = get_ipython()
ip.kernel.comm_manager.register_target('ipython.widget', Widget.handle_comm_opened)
