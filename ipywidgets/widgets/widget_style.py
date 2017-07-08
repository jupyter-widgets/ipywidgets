# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Contains the Style class"""

from traitlets import Unicode
from .widget import Widget


class Style(Widget):
    """Style specification"""

    _model_name = Unicode('StyleModel').tag(sync=True)
    _view_name = Unicode('StyleView').tag(sync=True)
    _view_module = Unicode('@jupyter-widgets/base').tag(sync=True)
    _view_module_version = Unicode('3.0.0').tag(sync=True)
