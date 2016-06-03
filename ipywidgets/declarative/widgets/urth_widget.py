# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
import time

from ipywidgets import widgets  # Widget definitions


class UrthWidget(widgets.Widget):
    """ A base class for Urth widgets. """

    def __init__(self, **kwargs):
        super(UrthWidget, self).__init__(**kwargs)

    def send_state(self, key=None):
        """
        Overrides the Widget send_state to prevent
        an unnecessary initial state message.
        """
        pass

    def _send_update(self, attribute, value):
        """
        Sends a message to update the front-end state of the given attribute.
        """
        msg = {
            "method": "update",
            "state": {
                attribute: value
            }
        }
        self._send(msg)

    def send_status(self, status, msg=""):
        """
        Sends a message to inform the front-end of the execution status.

        Parameters
        ----------
        status : string
            "ok" for success, "error" for failure.
        msg : string
            Message accompanying the status, e.g. an error message.
        """
        self._send({
            "method": "update",
            "state": {
                "__status__": {
                    "status": status,
                    "msg": msg,
                    "timestamp": round(time.time() * 1000)
                }
            }
        })

    def error(self, msg):
        """
        Inform the front-end that an error occurred, with the given error msg.
        Parameters
        ----------
        msg : string
            An error message.
        """
        self.send_status("error", msg)

    def ok(self, msg=""):
        """
        Inform the front-end that processing succeeded.
        Parameters
        ----------
        msg : string
            An optional message.
        """
        self.send_status("ok", msg)