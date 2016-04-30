"""Base Widget class.  Allows user to create widgets in the back-end that render
in the IPython notebook front-end.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


from contextlib import contextmanager
import collections
import sys

from IPython.core.getipython import get_ipython
from ipykernel.comm import Comm
from traitlets.config import LoggingConfigurable
from traitlets.utils.importstring import import_item
from traitlets import Unicode, Dict, Instance, List, Int, Set, Bytes
from ipython_genutils.py3compat import string_types, PY3

from .._version import __frontend_version__


def _widget_to_json(x, obj):
    if isinstance(x, dict):
        return {k: _widget_to_json(v, obj) for k, v in x.items()}
    elif isinstance(x, (list, tuple)):
        return [_widget_to_json(v, obj) for v in x]
    elif isinstance(x, Widget):
        return "IPY_MODEL_" + x.model_id
    else:
        return x

def _json_to_widget(x, obj):
    if isinstance(x, dict):
        return {k: _json_to_widget(v, obj) for k, v in x.items()}
    elif isinstance(x, (list, tuple)):
        return [_json_to_widget(v, obj) for v in x]
    elif isinstance(x, string_types) and x.startswith('IPY_MODEL_') and x[10:] in Widget.widgets:
        return Widget.widgets[x[10:]]
    else:
        return x

widget_serialization = {
    'from_json': _json_to_widget,
    'to_json': _widget_to_json
}

if PY3:
    _binary_types = (memoryview, bytes)
else:
    _binary_types = (memoryview, buffer)

class CallbackDispatcher(LoggingConfigurable):
    """A structure for registering and running callbacks"""
    callbacks = List()

    def __call__(self, *args, **kwargs):
        """Call all of the registered callbacks."""
        value = None
        for callback in self.callbacks:
            try:
                local_value = callback(*args, **kwargs)
            except Exception as e:
                ip = get_ipython()
                if ip is None:
                    self.log.warn("Exception in callback %s: %s", callback, e, exc_info=True)
                else:
                    ip.showtraceback()
            else:
                value = local_value if local_value is not None else value
        return value

    def register_callback(self, callback, remove=False):
        """(Un)Register a callback

        Parameters
        ----------
        callback: method handle
            Method to be registered or unregistered.
        remove=False: bool
            Whether to unregister the callback."""

        # (Un)Register the callback.
        if remove and callback in self.callbacks:
            self.callbacks.remove(callback)
        elif not remove and callback not in self.callbacks:
            self.callbacks.append(callback)

def _show_traceback(method):
    """decorator for showing tracebacks in IPython"""
    def m(self, *args, **kwargs):
        try:
            return(method(self, *args, **kwargs))
        except Exception as e:
            ip = get_ipython()
            if ip is None:
                self.log.warn("Exception in widget method %s: %s", method, e, exc_info=True)
            else:
                ip.showtraceback()
    return m


def register(key=None):
    """Returns a decorator registering a widget class in the widget registry.

    If no key is provided, the class name is used as a key.
    A key is provided for each core Jupyter widget so that the frontend can use
    this key regardless of the language of the kernel.
    """
    def wrap(widget):
        l = key if key is not None else widget.__module__ + widget.__name__
        Widget.widget_types[l] = widget
        return widget
    return wrap


class Widget(LoggingConfigurable):
    #-------------------------------------------------------------------------
    # Class attributes
    #-------------------------------------------------------------------------
    _widget_construction_callback = None
    widgets = {}
    widget_types = {}

    @staticmethod
    def on_widget_constructed(callback):
        """Registers a callback to be called when a widget is constructed.

        The callback must have the following signature:
        callback(widget)"""
        Widget._widget_construction_callback = callback

    @staticmethod
    def _call_widget_constructed(widget):
        """Static method, called when a widget is constructed."""
        if Widget._widget_construction_callback is not None and callable(Widget._widget_construction_callback):
            Widget._widget_construction_callback(widget)

    @staticmethod
    def handle_comm_opened(comm, msg):
        """Static method, called when a widget is constructed."""
        class_name = str(msg['content']['data']['widget_class'])
        if class_name in Widget.widget_types:
            widget_class = Widget.widget_types[class_name]
        else:
            widget_class = import_item(class_name)
        widget = widget_class(comm=comm)


    #-------------------------------------------------------------------------
    # Traits
    #-------------------------------------------------------------------------
    _model_module = Unicode('jupyter-js-widgets', help="""A requirejs module name
        in which to find _model_name. If empty, look in the global registry.""").tag(sync=True)
    _model_name = Unicode('WidgetModel', help="""Name of the backbone model
        registered in the front-end to create and sync this widget with.""").tag(sync=True)
    _view_module = Unicode(None, allow_none=True, help="""A requirejs module in which to find _view_name.
        If empty, look in the global registry.""").tag(sync=True)
    _view_name = Unicode(None, allow_none=True, help="""Default view registered in the front-end
        to use to represent the widget.""").tag(sync=True)
    comm = Instance('ipykernel.comm.Comm', allow_none=True)

    msg_throttle = Int(3, help="""Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.""").tag(sync=True)

    keys = List()
    def _keys_default(self):
        return [name for name in self.traits(sync=True)]

    _property_lock = Dict()
    _holding_sync = False
    _states_to_send = Set()
    _display_callbacks = Instance(CallbackDispatcher, ())
    _msg_callbacks = Instance(CallbackDispatcher, ())

    #-------------------------------------------------------------------------
    # (Con/de)structor
    #-------------------------------------------------------------------------
    def __init__(self, **kwargs):
        """Public constructor"""
        self._model_id = kwargs.pop('model_id', None)
        super(Widget, self).__init__(**kwargs)

        Widget._call_widget_constructed(self)
        self.open()

    def __del__(self):
        """Object disposal"""
        self.close()

    #-------------------------------------------------------------------------
    # Properties
    #-------------------------------------------------------------------------

    def open(self):
        """Open a comm to the frontend if one isn't already open."""
        if self.comm is None:
            state, buffer_keys, buffers = self._split_state_buffers(self.get_state())

            args = dict(target_name='jupyter.widget', data=state)
            if self._model_id is not None:
                args['comm_id'] = self._model_id

            self.comm = Comm(**args)
            if buffers:
                # FIXME: workaround ipykernel missing binary message support in open-on-init
                # send state with binary elements as second message
                self.send_state()

    def _comm_changed(self, name, new):
        """Called when the comm is changed."""
        if new is None:
            return
        self._model_id = self.model_id

        self.comm.on_msg(self._handle_msg)
        Widget.widgets[self.model_id] = self

    @property
    def model_id(self):
        """Gets the model id of this widget.

        If a Comm doesn't exist yet, a Comm will be created automagically."""
        return self.comm.comm_id

    #-------------------------------------------------------------------------
    # Methods
    #-------------------------------------------------------------------------

    def close(self):
        """Close method.

        Closes the underlying comm.
        When the comm is closed, all of the widget views are automatically
        removed from the front-end."""
        if self.comm is not None:
            Widget.widgets.pop(self.model_id, None)
            self.comm.close()
            self.comm = None
            self._ipython_display_ = None

    def _split_state_buffers(self, state):
        """Return (state_without_buffers, buffer_keys, buffers) for binary message parts"""
        buffer_keys, buffers = [], []
        for k, v in list(state.items()):
            if isinstance(v, _binary_types):
                state.pop(k)
                buffers.append(v)
                buffer_keys.append(k)
        return state, buffer_keys, buffers

    def send_state(self, key=None):
        """Sends the widget state, or a piece of it, to the front-end.

        Parameters
        ----------
        key : unicode, or iterable (optional)
            A single property's name or iterable of property names to sync with the front-end.
        """
        state = self.get_state(key=key)
        state, buffer_keys, buffers = self._split_state_buffers(state)
        msg = {'method': 'update', 'state': state, 'buffers': buffer_keys}
        self._send(msg, buffers=buffers)

    def get_state(self, key=None):
        """Gets the widget state, or a piece of it.

        Parameters
        ----------
        key : unicode or iterable (optional)
            A single property's name or iterable of property names to get.

        Returns
        -------
        state : dict of states
        metadata : dict
            metadata for each field: {key: metadata}
        """
        if key is None:
            keys = self.keys
        elif isinstance(key, string_types):
            keys = [key]
        elif isinstance(key, collections.Iterable):
            keys = key
        else:
            raise ValueError("key must be a string, an iterable of keys, or None")
        state = {}
        traits = self.traits() if not PY3 else {} # no need to construct traits on PY3
        for k in keys:
            to_json = self.trait_metadata(k, 'to_json', self._trait_to_json)
            value = to_json(getattr(self, k), self)
            if not PY3 and isinstance(traits[k], Bytes) and isinstance(value, bytes):
                value = memoryview(value)
            state[k] = value
        return state

    def set_state(self, sync_data):
        """Called when a state is received from the front-end."""
        # The order of these context managers is important. Properties must
        # be locked when the hold_trait_notification context manager is
        # released and notifications are fired.
        with self._lock_property(**sync_data), self.hold_trait_notifications():
            for name in sync_data:
                if name in self.keys:
                    from_json = self.trait_metadata(name, 'from_json',
                                                    self._trait_from_json)
                    self.set_trait(name, from_json(sync_data[name], self))

    def send(self, content, buffers=None):
        """Sends a custom msg to the widget model in the front-end.

        Parameters
        ----------
        content : dict
            Content of the message to send.
        buffers : list of binary buffers
            Binary buffers to send with message
        """
        self._send({"method": "custom", "content": content}, buffers=buffers)

    def on_msg(self, callback, remove=False):
        """(Un)Register a custom msg receive callback.

        Parameters
        ----------
        callback: callable
            callback will be passed three arguments when a message arrives::

                callback(widget, content, buffers)

        remove: bool
            True if the callback should be unregistered."""
        self._msg_callbacks.register_callback(callback, remove=remove)

    def on_displayed(self, callback, remove=False):
        """(Un)Register a widget displayed callback.

        Parameters
        ----------
        callback: method handler
            Must have a signature of::

                callback(widget, **kwargs)

            kwargs from display are passed through without modification.
        remove: bool
            True if the callback should be unregistered."""
        self._display_callbacks.register_callback(callback, remove=remove)

    def add_traits(self, **traits):
        """Dynamically add trait attributes to the Widget."""
        super(Widget, self).add_traits(**traits)
        for name, trait in traits.items():
            if trait.get_metadata('sync'):
                 self.keys.append(name)
                 self.send_state(name)

    def notify_change(self, change):
        """Called when a property has changed."""
        # Send the state before the user registered callbacks for trait changes
        # have all fired.
        name = change['name']
        if self.comm is not None and name in self.keys:
            # Make sure this isn't information that the front-end just sent us.
            if self._should_send_property(name, change['new']):
                # Send new state to front-end
                self.send_state(key=name)
        LoggingConfigurable.notify_change(self, change)

    #-------------------------------------------------------------------------
    # Support methods
    #-------------------------------------------------------------------------
    @contextmanager
    def _lock_property(self, **properties):
        """Lock a property-value pair.

        The value should be the JSON state of the property.

        NOTE: This, in addition to the single lock for all state changes, is
        flawed.  In the future we may want to look into buffering state changes
        back to the front-end."""
        self._property_lock = properties
        try:
            yield
        finally:
            self._property_lock = {}

    @contextmanager
    def hold_sync(self):
        """Hold syncing any state until the outermost context manager exits"""
        if self._holding_sync is True:
            yield
        else:
            try:
                self._holding_sync = True
                yield
            finally:
                self._holding_sync = False
                self.send_state(self._states_to_send)
                self._states_to_send.clear()

    def _should_send_property(self, key, value):
        """Check the property lock (property_lock)"""
        to_json = self.trait_metadata(key, 'to_json', self._trait_to_json)
        if (key in self._property_lock
            and to_json(value, self) == self._property_lock[key]):
            return False
        elif self._holding_sync:
            self._states_to_send.add(key)
            return False
        else:
            return True

    # Event handlers
    @_show_traceback
    def _handle_msg(self, msg):
        """Called when a msg is received from the front-end"""
        data = msg['content']['data']
        method = data['method']

        # Handle backbone sync methods CREATE, PATCH, and UPDATE all in one.
        if method == 'backbone':
            if 'sync_data' in data:
                # get binary buffers too
                sync_data = data['sync_data']
                for i,k in enumerate(data.get('buffer_keys', [])):
                    sync_data[k] = msg['buffers'][i]
                self.set_state(sync_data) # handles all methods

        # Handle a state request.
        elif method == 'request_state':
            self.send_state()

        # Handle a custom msg from the front-end.
        elif method == 'custom':
            if 'content' in data:
                self._handle_custom_msg(data['content'], msg['buffers'])

        # Catch remainder.
        else:
            self.log.error('Unknown front-end to back-end widget msg with method "%s"' % method)

    def _handle_custom_msg(self, content, buffers):
        """Called when a custom msg is received."""
        self._msg_callbacks(self, content, buffers)

    def _handle_displayed(self, **kwargs):
        """Called when a view has been displayed for this widget instance"""
        self._display_callbacks(self, **kwargs)

    @staticmethod
    def _trait_to_json(x, self):
        """Convert a trait value to json."""
        return x

    @staticmethod
    def _trait_from_json(x, self):
        """Convert json values to objects."""
        return x

    def _ipython_display_(self, **kwargs):
        """Called when `IPython.display.display` is called on the widget."""
        def loud_error(message):
            self.log.warn(message)
            sys.stderr.write('%s\n' % message)

        # Show view.
        if self._view_name is not None:
            validated = Widget._version_validated

            # Before the user tries to display a widget.  Validate that the
            # widget front-end is what is expected.
            if validated is None:
                loud_error('Widget Javascript not detected.  It may not be '
                           'installed properly. Did you enable the '
                           'widgetsnbextension? If not, then run "jupyter '
                           'nbextension enable --py --sys-prefix '
                           'widgetsnbextension"')
            elif not validated:
                loud_error('The installed widget Javascript is the wrong version.')

            self._send({"method": "display"})
            self._handle_displayed(**kwargs)

    def _send(self, msg, buffers=None):
        """Sends a message to the model in the front-end."""
        self.comm.send(data=msg, buffers=buffers)


Widget._version_validated = None
def handle_version_comm_opened(comm, msg):
    """Called when version comm is opened, because the front-end wants to
    validate the version."""
    def handle_version_message(msg):
        Widget._version_validated = msg['content']['data']['validated']
    comm.on_msg(handle_version_message)
    comm.send({'version': __frontend_version__})
