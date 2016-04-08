"""Interactive widgets for the Jupyter notebook.

Provide simple interactive controls in the notebook.
Each Widget corresponds to an object in Python and Javascript,
with controls on the page.

To put a Widget on the page, you can display it with IPython's display machinery::

    from ipywidgets import IntSlider
    from IPython.display import display
    slider = IntSlider(min=1, max=10)
    display(slider)

Moving the slider will change the value. Most Widgets have a current value,
accessible as a `value` attribute.
"""
from ._version import __version__
from warnings import warn

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'widgets',
        'require': 'widgets/extension'
    }]

def find_static_assets():
    warn("""To use widgets nbextension, you'll need to update your
        version of the Jupyter notebook to version 4.2 or later.""")
    return []
