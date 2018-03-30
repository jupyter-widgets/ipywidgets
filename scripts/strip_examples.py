#!/usr/bin/env python

"""strip outputs from an IPython Notebook
Opens a notebook, strips its output, and writes the outputless version to the original file.
Useful mainly as a git filter or pre-commit hook for users who don't want to track output in VCS.
This does mostly the same thing as the `Clear All Output` command in the notebook UI.
LICENSE: Public Domain
From https://gist.github.com/minrk/6176788

ls docs/source/examples/*.ipynb | xargs -I {} ./scripts/strip_examples.py "{}"

After running this on the examples, re-run the outputs on:

Using Interact.ipynb
Output Widget.ipynb
Image Browser.ipynb
Widget Basics.ipynb
Beat Frequencies.ipynb
Lorenz Differential Equations.ipynb
Widget Events.ipynb
Export As (nbconvert).ipynb
Exploring Graphs.ipynb
Image Processing.ipynb
Widget List.ipynb
Widget Styling.ipynb
Widget Low Level.ipynb
Factoring.ipynb
Widget Alignment.ipynb

"""
import io
import sys

try:
    # Jupyter >= 4
    from nbformat import read, write, NO_CONVERT
except ImportError:
    # IPython 3
    try:
        from IPython.nbformat import read, write, NO_CONVERT
    except ImportError:
        # IPython < 3
        from IPython.nbformat import current
    
        def read(f, as_version):
            return current.read(f, 'json')
    
        def write(nb, f):
            return current.write(nb, f, 'json')


def _cells(nb):
    """Yield all cells in an nbformat-insensitive manner"""
    if nb.nbformat < 4:
        for ws in nb.worksheets:
            for cell in ws.cells:
                yield cell
    else:
        for cell in nb.cells:
            yield cell


def strip_output(nb):
    """strip the outputs from a notebook object"""
    nb.metadata.pop('signature', None)
    nb.metadata.pop('widgets', None)
    for cell in _cells(nb):
        if 'outputs' in cell:
            cell['outputs'] = []
        if 'prompt_number' in cell:
            cell['prompt_number'] = None
    return nb


if __name__ == '__main__':
    filename = sys.argv[1]
    with io.open(filename, 'r', encoding='utf8') as f:
        nb = read(f, as_version=NO_CONVERT)
    nb = strip_output(nb)
    with io.open(filename, 'w', encoding='utf8') as f:
        write(nb, f)
