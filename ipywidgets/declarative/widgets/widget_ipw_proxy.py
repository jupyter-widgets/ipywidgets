# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Unicode # Used to declare attributes of our widget
from IPython.core.getipython import get_ipython

from .urth_widget import UrthWidget
from .urth_exception import UrthException


class IpywProxy(UrthWidget):
    """
    A Widget to prowy IPywidgets
    """
    widget_name = Unicode('', sync=True)

    def __init__(self, **kwargs):
        self.log.info("Created a new IpywProxy widget.")

        self.on_msg(self._handle_custom_event_msg)
        self.shell = get_ipython()

        super(IpywProxy, self).__init__(**kwargs)

    def _widget_name_changed(self, old, new):
        try:
            self.log.info("Binding to widget name {}...".format(new))
            self._sync_state()
            self.ok()
        except Exception as e:
            self.error(str(e))

    def _handle_custom_event_msg(self, wid, content, buffers):
        event = content.get('event', '')
        if event == 'sync':
            self._sync_state()

    def _the_widget(self):
        if self.widget_name in self.shell.user_ns:
            return self.shell.user_ns[self.widget_name]
        else:
            raise UrthException("Could not find a widget with name {}".format(
                self.widget_name))

    def _sync_state(self):
        try:
            the_widget = self._the_widget()
            # display the widget
            self._send_update("id", the_widget.model_id)

        except Exception as e:
            self.error("Error while getting the ipywidget model id: {}".format(str(e)))
