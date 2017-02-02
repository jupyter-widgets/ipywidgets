"""Contains the Style class"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Unicode
from .widget import Widget


class Style(Widget):
    """Style specification"""

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('StyleView').tag(sync=True)
    _model_name = Unicode('StyleModel').tag(sync=True)
