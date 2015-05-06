# Interactive HTML Widgets

[![Build Status](https://travis-ci.org/ipython/ipython_widgets.svg?branch=master)](https://travis-ci.org/ipython/ipython_widgets) [![Join the chat at https://gitter.im/ipython/ipython_widgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipython_widgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Interactive HTML widgets for Jupyter notebooks and the IPython kernel.

## Install

0. Install [jupyter_notebook](https://github.com/jupyter/jupyter_notebook)

1. Install the package
    
        gulp css
        pip install -e .

2. Install and register the notebook extension:

        python -m ipython_widgets.install --enable
    
    or a symlink for a development install:

        python -m ipython_widgets.install --enable --user --symlink

## Test

To run the Javascript tests:

    python -m ipython_widgets.jstest

To run the Python tests:

    nosetests --with-coverage --cover-package=ipython_widgets ipython_widgets
