# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from collections import defaultdict

from .urth_widget import UrthWidget

# Global variable used to store the current Channels instance
the_channels = None


class Channels(UrthWidget):
    """ A widget that provides an API for setting bound channel variables. """

    def __init__(self, value=None, **kwargs):
        self.log.info("Created a new Channels widget.")
        self.serializer = None
        global the_channels
        the_channels = self

        self.on_msg(self._handle_change_msg)

        # maps channel name to a map of variable name to handler function
        self.watch_handlers = defaultdict(dict)

        super(Channels, self).__init__(**kwargs)

    def set(self, key, value, chan='default', **kwargs):

        # Need to lazy import Serializers to avoid issue with matplotlib.
        # The Kernel errors if the inline magic runs
        # after the modules get imported.
        if self.serializer is None:
            from urth.util.serializer import Serializer
            self.serializer = Serializer()

        attr = "{}:{}".format(chan, key)
        serialized = self.serializer.serialize(value, **kwargs)
        self._send_update(attr, serialized)

    def watch(self, key, handler, chan='default'):
        self.watch_handlers[chan][key] = handler

    def _handle_change_msg(self, wid, content, buffers):
        if content.get('event', '') == 'change':
            data = content.get('data', {})
            if 'channel' in data and data['channel'] in self.watch_handlers:
                chan_handlers = self.watch_handlers[data['channel']]
                if 'name' in data and data['name'] in chan_handlers:
                    handler = chan_handlers[data['name']]
                    old = data.get('old_val', None)
                    new = data.get('new_val', None)
                    try:
                        handler(old, new)
                        self.ok()
                    except Exception as e:
                        self.error("Error executing watch handler for {} on "
                                   "channel {}: {}".format(
                                    data['name'], data['channel'], str(e)))


class Channel:
    """ Provides methods for interacting with a single channel."""

    def __init__(self, chan):
        self.chan = chan

    def set(self, key, value, **kwargs):
        global the_channels
        the_channels.set(key, value, self.chan, **kwargs)

    def watch(self, key, handler):
        global the_channels
        the_channels.watch(key, handler, self.chan)


def channel(chan='default'):
    """ API function for retrieving a single channel.

    Parameters
    ----------
    chan : string
        The channel name.

    Returns
    -------
    Channel
        The Channel object corresponding to the given channel name.

    """
    return Channel(chan)

