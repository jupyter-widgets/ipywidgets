"""Controller class.

Represents a Gamepad or Joystick controller.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget import Widget, register, widget_serialization
from traitlets import Bool, Int, Float, Unicode, List, Instance


@register('IPython.ControllerButton')
class Button(Widget):
    """Represents a gamepad or joystick button"""
    value = Float(min=0.0, max=1.0, read_only=True, sync=True)
    pressed = Bool(read_only=True, sync=True)

    _view_name = Unicode('ControllerButton', sync=True)


@register('IPython.ControllerAxis')
class Axis(Widget):
    """Represents a gamepad or joystick axis"""
    value = Float(min=-1.0, max=1.0, read_only=True, sync=True)

    _view_name = Unicode('ControllerAxis', sync=True)


@register('IPython.Controller')
class Controller(Widget):
    """Represents a game controller"""
    index = Int(sync=True)

    # General information about the gamepad, button and axes mapping, name.
    # These values are all read-only and set by the JavaScript side.
    name = Unicode(read_only=True, sync=True)
    mapping = Unicode(read_only=True, sync=True)
    connected = Bool(read_only=True, sync=True)
    timestamp = Float(read_only=True, sync=True)

    # Buttons and axes - read-only
    buttons = List(trait=Instance(Button), read_only=True,
                   sync=True, **widget_serialization)
    axes = List(trait=Instance(Axis), read_only=True, sync=True,
                **widget_serialization)

    _view_name = Unicode('ControllerView', sync=True)
    _model_name = Unicode('Controller', sync=True)
 
