import sys
from unittest import TestCase
from contextlib import contextmanager

from IPython.display import Markdown, Image
from ipywidgets import widget_output


class TestOutputWidget(TestCase):

    @contextmanager
    def _mocked_ipython(self, get_ipython, clear_output):
        original_clear_output = widget_output.clear_output
        original_get_ipython = widget_output.get_ipython
        widget_output.get_ipython = get_ipython
        widget_output.clear_output = clear_output
        try:
            yield
        finally:
            widget_output.clear_output = original_clear_output
            widget_output.get_ipython = original_get_ipython

    def _mock_get_ipython(self, msg_id):
        # Specifically override this so the traceback
        # is still printed to screen
        def showtraceback(self_, exc_tuple, *args, **kwargs):
            etype, evalue, tb = exc_tuple
            raise etype(evalue)
        kernel = type(
            'mock_kernel',
            (object, ),
            {'_parent_header': {'header': {'msg_id': msg_id}}}
        )
        ipython = type(
            'mock_ipython',
            (object, ),
            {'kernel': kernel, 'showtraceback': showtraceback}
        )
        return ipython

    def _mock_clear_output(self):
        calls = []

        def clear_output(*args, **kwargs):
            calls.append((args, kwargs))
        clear_output.calls = calls

        return clear_output

    def test_set_msg_id_when_capturing(self):
        msg_id = 'msg-id'
        get_ipython = self._mock_get_ipython(msg_id)
        clear_output = self._mock_clear_output()

        with self._mocked_ipython(get_ipython, clear_output):
            widget = widget_output.Output()
            assert widget.msg_id == ''
            with widget:
                assert widget.msg_id == msg_id
            assert widget.msg_id == ''

    def test_clear_output(self):
        msg_id = 'msg-id'
        get_ipython = self._mock_get_ipython(msg_id)
        clear_output = self._mock_clear_output()

        with self._mocked_ipython(get_ipython, clear_output):
            widget = widget_output.Output()
            widget.clear_output(wait=True)

        assert len(clear_output.calls) == 1
        assert clear_output.calls[0] == ((), {'wait': True})


def _make_stream_output(text, name):
    return {
        'output_type': 'stream',
        'name': name,
        'text': text
    }


def test_append_stdout():
    widget = widget_output.Output()

    # Try appending a message to stdout.
    widget.append_stdout("snakes!")
    expected = (_make_stream_output("snakes!", "stdout"),)
    assert widget.outputs == expected, repr(widget.outputs)

    # Try appending a second message.
    widget.append_stdout("more snakes!")
    expected += (_make_stream_output("more snakes!", "stdout"),)
    assert widget.outputs == expected, repr(widget.outputs)


def test_append_stderr():
    widget = widget_output.Output()

    # Try appending a message to stderr.
    widget.append_stderr("snakes!")
    expected = (_make_stream_output("snakes!", "stderr"),)
    assert widget.outputs == expected, repr(widget.outputs)

    # Try appending a second message.
    widget.append_stderr("more snakes!")
    expected += (_make_stream_output("more snakes!", "stderr"),)
    assert widget.outputs == expected, repr(widget.outputs)


def test_append_display_data():
    widget = widget_output.Output()

    # Try appending a Markdown object.
    widget.append_display_data(Markdown("# snakes!"))
    expected = (
        {
            'output_type': 'display_data',
            'data': {
                'text/plain': '<IPython.core.display.Markdown object>',
                'text/markdown': '# snakes!'
            },
            'metadata': {}
        },
    )
    assert widget.outputs == expected, repr(widget.outputs)

    # Now try appending an Image.
    image_data = b"foobar"
    image_data_b64 = image_data if sys.version_info[0] < 3 else 'Zm9vYmFy\n'

    widget.append_display_data(Image(image_data, width=123, height=456))
    expected += (
        {
            'output_type': 'display_data',
            'data': {
                'image/png': image_data_b64,
                'text/plain': '<IPython.core.display.Image object>'
            },
            'metadata': {
                'image/png': {
                    'width': 123,
                    'height': 456
                }
            }
        },
    )
    assert widget.outputs == expected, repr(widget.outputs)
