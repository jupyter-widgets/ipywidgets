# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Image class.

Represents an image in the frontend using a widget.
"""
import mimetypes

from .widget_core import CoreWidget
from .domwidget import DOMWidget
from .valuewidget import ValueWidget
from .widget import register
from traitlets import Unicode, CUnicode, Bytes, validate


def _text_type():
    # six is not a direct dependency of this module
    # This replicates six.text_type
    try:
        return unicode
    except NameError:
        return str
_text_type = _text_type()


@register
class Image(DOMWidget, ValueWidget, CoreWidget):
    """Displays an image as a widget.

    The `value` of this widget accepts a byte string.  The byte string is the
    raw image data that you want the browser to display.  You can explicitly
    define the format of the byte string using the `format` trait (which
    defaults to "png").

    If you pass `"url"` to the `"format"` trait, `value` will be interpreted
    as a URL as bytes encoded in UTF-8.
    """
    _view_name = Unicode('ImageView').tag(sync=True)
    _model_name = Unicode('ImageModel').tag(sync=True)

    # Define the custom state properties to sync with the front-end
    format = Unicode('png', help="The format of the image.").tag(sync=True)
    width = CUnicode(help="Width of the image in pixels.").tag(sync=True)
    height = CUnicode(help="Height of the image in pixels.").tag(sync=True)
    value = Bytes(help="The image data as a byte string.").tag(sync=True)

    @classmethod
    def from_file(cls, filename, **kwargs):
        """
        Create an :class:`Image` from a local file.

        Parameters
        ----------
        filename: str
            The location of a file to read into the value from disk.

        **kwargs:
            The keyword arguments for `Image`

        Returns an `Image` with the value set from the filename.
        """
        value = cls._load_file_value(filename)

        if 'format' not in kwargs:
            img_format = cls._guess_format(filename)
            if img_format is not None:
                kwargs['format'] = img_format

        return cls(value=value, **kwargs)

    @classmethod
    def from_url(cls, url, **kwargs):
        """
        Create an :class:`Image` from a URL.

        :code:`Image.from_url(url)` is equivalent to:

        .. code-block: python

            img = Image(value=url, format='url')

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
            if not mtype.startswith('image/'):
                return None

            return mtype[len('image/'):]
        except Exception:
            return None
