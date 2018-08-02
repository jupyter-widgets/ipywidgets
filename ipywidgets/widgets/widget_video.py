# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Video class.

Represents a video in the frontend using a widget.
"""
import mimetypes

from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .valuewidget import ValueWidget
from .widget import register
from traitlets import Unicode, CUnicode, Bytes, Bool
from .trait_types import bytes_serialization


def _text_type():
    # six is not a direct dependency of this module
    # This replicates six.text_type
    try:
        return unicode
    except NameError:
        return str
_text_type = _text_type()


@register
class Video(DOMWidget, ValueWidget, CoreWidget):
    """Displays a video as a widget.

    The `value` of this widget accepts a byte string.  The byte string is the
    raw video data that you want the browser to display.  You can explicitly
    define the format of the byte string using the `format` trait (which
    defaults to "mp4").

    If you pass `"url"` to the `"format"` trait, `value` will be interpreted
    as a URL as bytes encoded in UTF-8.
    """
    _view_name = Unicode('VideoView').tag(sync=True)
    _model_name = Unicode('VideoModel').tag(sync=True)

    # Define the custom state properties to sync with the front-end
    format = Unicode('mp4', help="The format of the video.").tag(sync=True)
    width = CUnicode(help="Width of the video in pixels.").tag(sync=True)
    height = CUnicode(help="Height of the video in pixels.").tag(sync=True)
    value = Bytes(help="The video data as a byte string.").tag(sync=True, **bytes_serialization)
    autoplay = Bool(True, help="When true, the video starts when it's displayed").tag(sync=True)
    loop = Bool(True, help="When true, the video will start from the beginning after finishing").tag(sync=True)
    controls = Bool(True, help="Specifies that video controls should be displayed (such as a play/pause button etc)").tag(sync=True)

    @classmethod
    def from_file(cls, filename, **kwargs):
        """
        Create an :class:`Video` from a local file.

        Parameters
        ----------
        filename: str
            The location of a file to read into the value from disk.

        **kwargs:
            The keyword arguments for `Video`

        Returns an `Video` with the value set from the filename.
        """
        value = cls._load_file_value(filename)

        if 'format' not in kwargs:
            vid_format = cls._guess_format(filename)
            if vid_format is not None:
                kwargs['format'] = vid_format

        return cls(value=value, **kwargs)

    @classmethod
    def from_url(cls, url, **kwargs):
        """
        Create an :class:`Video` from a URL.

        :code:`Video.from_url(url)` is equivalent to:

        .. code-block: python

            img = Video(value=url, format='url')

        But both unicode and bytes arguments are allowed for ``url``.

        Parameters
        ----------
        url: [str, bytes]
            The location of a URL to load.
        """
        if isinstance(url, _text_type):
            # If unicode (str in Python 3), it needs to be encoded to bytes
            url = url.encode('utf-8')

        return cls(value=url, format='url')

    def set_value_from_file(self, filename):
        """
        Convenience method for reading a file into `value`.

        Parameters
        ----------
        filename: str
            The location of a file to read into value from disk.
        """
        value = self._load_file_value(filename)

        self.value = value

    @classmethod
    def _load_file_value(cls, filename):
        if getattr(filename, 'read', None) is not None:
            return filename.read()
        else:
            with open(filename, 'rb') as f:
                return f.read()

    @classmethod
    def _guess_format(cls, filename):
        # file objects may have a .name parameter
        name = getattr(filename, 'name', None)
        name = name or filename

        try:
            mtype, _ = mimetypes.guess_type(name)
            if not mtype.startswith('video/'):
                return None

            return mtype[len('video/'):]
        except Exception:
            return None

    def __repr__(self):
        # Truncate the value in the repr, since it will
        # typically be very, very large.
        class_name = self.__class__.__name__

        # Return value first like a ValueWidget
        signature = []
        sig_value = repr(self.value)
        prefix, rest = sig_value.split("'", 1)
        content = rest[:-1]
        if len(content) > 100:
            sig_value = "{}'{}...'".format(prefix, content[0:100])
        signature.append('%s=%s' % ('value', sig_value))

        for key in super(Video, self)._repr_keys():
            if key == 'value':
                continue
            value = str(getattr(self, key))
            signature.append('%s=%r' % (key, value))
        signature = ', '.join(signature)
        return '%s(%s)' % (class_name, signature)
