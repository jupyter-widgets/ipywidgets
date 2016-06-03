# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


class UrthException(Exception):
    """
    A generic exception for Urth Widgets.
    """

    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg