try:  # IPython/Jupyter 4.x
    from ipywidgets import Widget, widget_serialization
    from traitlets import Bool, Int, Float, Unicode, List, Instance
except ImportError:  # IPython 3.x
    from IPython.html.widgets import Widget
    from IPython.utils.traitlets import Bool, Int, Float, Unicode, List, Instance
    widget_serialization = {}


class Button(Widget):
    """Represents a gamepad or joystick button"""
    value = Float(min=0.0, max=1.0, read_only=True, sync=True)
    pressed = Bool(read_only=True, sync=True)

    _view_name = Unicode('Button', sync=True)
    _view_module = Unicode('nbextensions/gamepad/gamepad', sync=True)


class Axis(Widget):
    """Represents a gamepad or joystick axis"""
    value = Float(min=-1.0, max=1.0, read_only=True, sync=True)

    _view_name = Unicode('Axis', sync=True)
    _view_module = Unicode('nbextensions/gamepad/gamepad', sync=True)


class GamePad(Widget):
    """Represents a game controller"""
    index = Int(sync=True)

    # General information about the gamepad, button and axes mapping, id.
    # These values are all read-only and set by the JavaScript side.
    id = Unicode(read_only=True, sync=True)
    mapping = Unicode(read_only=True, sync=True)
    connected = Bool(read_only=True, sync=True)
    timestamp = Float(read_only=True, sync=True)

    # Buttons and axes - read-only
    buttons = List(trait=Instance(Button), read_only=True,
                   sync=True, **widget_serialization)
    axes = List(trait=Instance(Axis), read_only=True, sync=True,
                **widget_serialization)

    _view_name = Unicode('GamepadView', sync=True)
    _view_module = Unicode('nbextensions/gamepad/gamepad', sync=True)

    _model_name = Unicode('Gamepad', sync=True)
    _model_module = Unicode('nbextensions/gamepad/gamepad', sync=True)
 
