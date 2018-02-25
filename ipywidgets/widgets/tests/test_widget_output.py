import sys

from IPython.display import Markdown, Image
from ipywidgets import widget_output


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
