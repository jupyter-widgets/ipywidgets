# Interactive HTML Widgets

[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets) [![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb) for Jupyter notebooks and the IPython kernel.

## Install

You can install the current version of ipywidgets with pip or conda:

    pip install ipywidgets
    # or
    conda install ipywidgets


### Development install

To install ipywidgets from git, you will need [npm](https://www.npmjs.com/).

0. clone the repo:

        git clone https://github.com/ipython/ipywidgets
        cd ipywidgets

1. Dev-install of the package (run from repo directory):

        pip install -e .


## Test

To run the Python tests:

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

To run the Javascript tests:

    npm run buildtests; python -m ipywidgets.jstest

To run the Javascript tests with all output printed:

    npm run buildtests; python -m ipywidgets.jstest -- --logall

Description of jstest additional arguments:
logall - If there is atleast one failure in the notebook, log information for every cell.
logsuccess - Log information for every cell in the notebook, regardless of failure.
