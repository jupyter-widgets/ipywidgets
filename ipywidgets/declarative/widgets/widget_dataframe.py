# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Unicode, Integer # Used to declare attributes of our widget
from IPython.core.getipython import get_ipython

from urth.util.serializer import Serializer
from .urth_widget import UrthWidget
from .urth_exception import UrthException


class DataFrame(UrthWidget):
    """
    A widget for retrieving the value of a DataFrame in the kernel.
    """
    variable_name = Unicode('', sync=True)
    limit = Integer(100, sync=True)

    def __init__(self, value=None, **kwargs):
        self.log.info("Created a new DataFrame widget.")

        self.on_msg(self._handle_state_msg)
        self.shell = get_ipython()
        self.serializer = Serializer()
        super(DataFrame, self).__init__(**kwargs)

    def _variable_name_changed(self, old, new):
        self.log.info("Binding to variable name {}...".format(new))

    def _limit_changed(self, old, new):
        self.log.info("Changed value of limit to {}...".format(new))

    def _the_dataframe(self):
        if self.variable_name in self.shell.user_ns:
            return self.shell.user_ns[self.variable_name]
        else:
            raise UrthException("Invalid DataFrame variable name {}".format(
                self.variable_name))

    def _handle_state_msg(self, wid, content, buffers):
        if content.get("event", "") == "sync":
            self._sync_state()

    def _sync_state(self):
        try:
            val = self._the_dataframe()
            serialized_result = self.serializer.serialize(val, limit=self.limit)
            self._send_update("value", serialized_result)
            self.ok()
        except Exception as e:
            self.error(str(e))
