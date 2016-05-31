"""Media class.

Represents a camera or audio source.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, register, widget_serialization
from .domwidget import DOMWidget
from traitlets import Bool, Dict, Int, Float, Unicode, List, Instance


@register('Jupyter.Media')
class Media(DOMWidget):
    """Represents a media source."""

    # Specify audio constraint and video constraint as a boolean or dict.
    audio = Bool(False).tag(sync=True)
    video = Bool(True).tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('MediaView').tag(sync=True)
    _model_name = Unicode('MediaModel').tag(sync=True)
