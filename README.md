# Interactive HTML Widgets

[![Google Group](https://img.shields.io/badge/-Google%20Group-lightgrey.svg)](https://groups.google.com/forum/#!forum/jupyter)
[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets)
[![Documentation Status](https://readthedocs.org/projects/ipywidgets/badge/?version=latest)](http://ipywidgets.readthedocs.org/en/latest/?badge=latest)
[![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb)
for Jupyter notebooks and the IPython kernel.

A [demonstration notebook](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb) provides an overview of the interactive widgets. For detailed information, please refer to the [ipywidgets documentation](http://ipywidgets.readthedocs.org/en/latest/).

## Install

Install the current version of ipywidgets using pip or conda:

    pip install ipywidgets

or

    conda install ipywidgets

### JavaScript only

If you're interested in only installing the JavaScript, you may do so by running

    npm install jupyter-js-widgets

### Development install

To install ipywidgets from git, you will need [npm](https://www.npmjs.com/).

0. clone the repo:

        git clone https://github.com/ipython/ipywidgets
        cd ipywidgets

1. Dev-install of the package (run from repo directory):

        pip install -v -e .

2. Install the Jupyter Widgets nbextension

        cd widgetsnbextension
        pip install -v -e .

    Note: You need to have npm installed.  The installation process will
    complain if you don't.  If you install using sudo, you need to make sure
    that npm is also available in the PATH used with sudo.

    Note: Development of the jupyter-js-widgets Javascript is normally done
    separate to the nbextension and ipywidgets.  If you'd like to develop
    both at the same time, change the npm package.json of widgetsnbextension
    so jupyter-js-widgets is "file:../jupyter-js-widgets".  Each time you
    make changes to jupyter-js-widgets you'll need to update it in
    widgetsnbextension by removing it and reinstalling it.  This can be done
    from within the widgets nbextension directory by running
    `rm -rf node_modules/jupyter-js-widgets; npm install`.


## Test

To run the Python tests:

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

To run the Javascript tests:

    cd jupyter-js-widgets; npm run test

This will run the test suite using `karma` with 'debug' level logging.

## Resources
### ipywidgets
- [Demo notebook of interactive widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb)
- [Documentation for ipywidgets](http://ipywidgets.readthedocs.org/en/latest/) [[PDF](https://media.readthedocs.org/pdf/ipywidgets/latest/ipywidgets.pdf)]
- [Issues](https://github.com/ipython/ipywidgets/issues)
- [Technical support - Jupyter Google Group](https://groups.google.com/forum/#!forum/jupyter)

### Project Jupyter
- [Project Jupyter website](https://jupyter.org)
- [Online Demo of Jupyter Notebook at try.jupyter.org](https://try.jupyter.org)
- [Documentation for Project Jupyter](http://jupyter.readthedocs.org/en/latest/index.html) [[PDF](https://media.readthedocs.org/pdf/jupyter/latest/jupyter.pdf)]
