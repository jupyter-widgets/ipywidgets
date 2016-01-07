# Interactive HTML Widgets

[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets)
[![Documentation Status](https://readthedocs.org/projects/ipywidgets/badge/?version=latest)](http://ipywidgets.readthedocs.org/en/latest/?badge=latest)
[![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/examples/notebooks/Index.ipynb) for Jupyter notebooks and the IPython kernel.

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

        pip install -v -e .

    Note: You need to have npm installed.  The installation process will 
    complain if you don't.  If you install using sudo, you need to make sure 
    that npm is also available in the PATH used with sudo.


## Test

To run the Python tests:

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

To run the Javascript tests:

    npm run test

This will run the test suit using `karma` with 'debug' level logging.
