# Interactive HTML Widgets

Interactive HTML widgets for Jupyter notebooks and the IPython kernel.

## install

0. install [jupyter_notebook](https://github.com/jupyter/jupyter_notebook)

1. install the package
    
        gulp css
        pip install -e .

2. install and register the notebook extension:

        python -m ipython_widgets.install --enable
    
    or a symlink for a development install:

        python -m ipython_widgets.install --enable --user --symlink

