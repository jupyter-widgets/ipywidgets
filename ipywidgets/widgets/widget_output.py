# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Output class.

Represents a widget that can be used to display output within the widget area.
"""

from .domwidget import DOMWidget
from .widget import register
from .widget_core import CoreWidget
from .._version import __jupyter_widgets_output_version__

import sys
from traitlets import Unicode, Tuple
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import clear_output
from IPython import get_ipython


@register
class Output(DOMWidget):
    """Widget used as a context manager to display output.

    This widget can capture and display stdout, stderr, and rich output.  To use
    it, create an instance of it and display it.  Then use it as a context
    manager.  Any output produced while in it's context will be captured and
    displayed in it instead of the standard output area.

    Example::
        import ipywidgets as widgets
        from IPython.display import display
        out = widgets.Output()
        display(out)

        print('prints to output area')

        with out:
            print('prints to output widget')
    """
    _view_name = Unicode('OutputView').tag(sync=True)
    _model_name = Unicode('OutputModel').tag(sync=True)
    _view_module = Unicode('@jupyter-widgets/output').tag(sync=True)
    _model_module = Unicode('@jupyter-widgets/output').tag(sync=True)
    _view_module_version = Unicode(__jupyter_widgets_output_version__).tag(sync=True)
    _model_module_version = Unicode(__jupyter_widgets_output_version__).tag(sync=True)

    msg_id = Unicode('', help="Parent message id of messages to capture").tag(sync=True)
    outputs = Tuple(help="The output messages synced from the frontend.").tag(sync=True)

    def clear_output(self, *pargs, **kwargs):
        with self:
            clear_output(*pargs, **kwargs)

    def __enter__(self):
        """Called upon entering output widget context manager."""
        self._flush()
        ip = get_ipython()
        if ip and hasattr(ip, 'kernel') and hasattr(ip.kernel, '_parent_header'):
            self.msg_id = ip.kernel._parent_header['header']['msg_id']

    def __exit__(self, etype, evalue, tb):
        """Called upon exiting output widget context manager."""
        ip = get_ipython()
        if etype is not None:
            ip.showtraceback((etype, evalue, tb), tb_offset=0)
        self._flush()
        self.msg_id = ''
        # suppress exceptions, since they are shown above
        return True

    def _flush(self):
        """Flush stdout and stderr buffers."""
        sys.stdout.flush()
        sys.stderr.flush()

    def _append_stream_output(self, text, stream_name):
        """Append a stream output."""
        self.outputs += (
            {'output_type': 'stream', 'name': stream_name, 'text': text},
        )

    def append_stdout(self, text):
        """Append text to the stdout stream."""
        self._append_stream_output(text, stream_name='stdout')

    def append_stderr(self, text):
        """Append text to the stderr stream."""
        self._append_stream_output(text, stream_name='stderr')

    def append_display_data(self, display_object):
        """Append a display object as an output.

        Parameters
        ----------
        display_object : IPython.core.display.DisplayObject
            The object to display (e.g., an instance of
            `IPython.display.Markdown` or `IPython.display.Image`).
        """
        fmt = InteractiveShell.instance().display_formatter.format
        data, metadata = fmt(display_object)
        self.outputs += (
            {
                'output_type': 'display_data',
                'data': data,
                'metadata': metadata
            },
        )
