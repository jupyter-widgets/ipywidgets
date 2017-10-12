import sys

from IPython.display import Markdown, Image
from ipywidgets import Output


def _make_stream_output(text, name):
        return {
            'output_type': 'stream',
            'name': name,
            'text': text
        }


def test_append_stdout():
    output = Output()

    # Try appending a message to stdout.
    output.append_stdout("snakes!")
    expected = (_make_stream_output("snakes!", "stdout"),)
    assert output.outputs == expected, repr(output.outputs)

    # Try appending a second message.
    output.append_stdout("more snakes!")
    expected += (_make_stream_output("more snakes!", "stdout"),)
    assert output.outputs == expected, repr(output.outputs)


def test_append_stderr():
    output = Output()

    # Try appending a message to stderr.
    output.append_stderr("snakes!")
    expected = (_make_stream_output("snakes!", "stderr"),)
    assert output.outputs == expected, repr(output.outputs)

    # Try appending a second message.
    output.append_stderr("more snakes!")
    expected += (_make_stream_output("more snakes!", "stderr"),)
    assert output.outputs == expected, repr(output.outputs)


def test_append_display_data():
    output = Output()

    # Try appending a Markdown object.
    output.append_display_data(Markdown("# snakes!"))
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
    assert output.outputs == expected, repr(output.outputs)

    # Now try appending an Image.
    image_data = b"foobar"
    image_data_b64 = image_data if sys.version_info[0] < 3 else 'Zm9vYmFy\n'

    output.append_display_data(Image(image_data, width=123, height=456))
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
    assert output.outputs == expected, repr(output.outputs)
