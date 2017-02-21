# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Controller class.

Represents a Gamepad or Joystick controller.
"""

from .valuewidget import ValueWidget
from .widget import register, widget_serialization
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from traitlets import Bool, Int, Float, Unicode, List, Instance


@register('Jupyter.ControllerButton')
class Button(ValueWidget, CoreWidget):
    """Represents a gamepad or joystick button."""
    value = Float(min=0.0, max=1.0, read_only=True).tag(sync=True)
    pressed = Bool(read_only=True).tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('ControllerButtonView').tag(sync=True)
    _model_name = Unicode('ControllerButtonModel').tag(sync=True)


@register('Jupyter.ControllerAxis')
class Axis(ValueWidget, CoreWidget):
    """Represents a gamepad or joystick axis."""
    value = Float(min=-1.0, max=1.0, read_only=True).tag(sync=True)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('ControllerAxisView').tag(sync=True)
    _model_name = Unicode('ControllerAxisModel').tag(sync=True)


@register('Jupyter.Controller')
class Controller(DOMWidget, CoreWidget):
    """Represents a game controller."""
    index = Int().tag(sync=True)

    # General information about the gamepad, button and axes mapping, name.
    # These values are all read-only and set by the JavaScript side.
    name = Unicode(read_only=True).tag(sync=True)
    mapping = Unicode(read_only=True).tag(sync=True)
    connected = Bool(read_only=True).tag(sync=True)
    timestamp = Float(read_only=True).tag(sync=True)

    # Buttons and axes - read-only
    buttons = List(trait=Instance(Button), read_only=True).tag(sync=True, **widget_serialization)
    axes = List(trait=Instance(Axis), read_only=True).tag(sync=True, **widget_serialization)

    _model_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_module = Unicode('jupyter-js-widgets').tag(sync=True)
    _view_name = Unicode('ControllerView').tag(sync=True)
    _model_name = Unicode('ControllerModel').tag(sync=True)
