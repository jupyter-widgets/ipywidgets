# Interactive HTML Widgets

[![Join the chat at https://gitter.im/ipython/ipython_widgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipython_widgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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

