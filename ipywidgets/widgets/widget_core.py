# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Base widget class for widgets provided in Core"""

from .widget import Widget
from .._version import __frontend_version__

from traitlets import Unicode

class CoreWidget(Widget):

    _model_module_version = Unicode(__frontend_version__).tag(sync=True)
    _view_module_version = Unicode(__frontend_version__).tag(sync=True)

