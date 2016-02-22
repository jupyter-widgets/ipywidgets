# Interactive HTML Widgets

[![Google Group](https://img.shields.io/badge/-Google%20Group-lightgrey.svg)](https://groups.google.com/forum/#!forum/jupyter)
[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets)
[![Documentation Status](https://readthedocs.org/projects/ipywidgets/badge/?version=latest)](http://ipywidgets.readthedocs.org/en/latest/?badge=latest)
[![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb)
for Jupyter notebooks and the IPython kernel.

A [demonstration notebook](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb) provides an overview of the interactive widgets. For detailed information, please refer to the [ipywidgets documentation](http://ipywidgets.readthedocs.org/en/latest/).

**Compatibility**
| ipywidgets version  | Jupyter/notebook version |
| ------------------- | ------------------------ |
| master              | master                   |
| 4.1.x               | 4.1                      |
| 4.0.x               | 4.0                      |


## Install

Install the current version of ipywidgets using pip or conda:

    pip install ipywidgets

or

    conda install ipywidgets

### JavaScript only

If you're interested in only installing the JavaScript, you may do so by running

    npm install jupyter-js-widgets

### Development install

To install ipywidgets from git, you will need [npm](https://www.npmjs.com/) and
the latest [development copy of the Jupyter
notebook](https://github.com/jupyter/notebook) because everything in the
ipywidgets repository is developed using Jupyter notebook master. If you want
to have a copy of ipywidgets that works against a stable version of the
notebook, checkout the appropriate tag (see the Compatibility table above).

If you install using sudo, you need to make sure that npm is also
available in the PATH used with sudo.

0. clone the repo:

        git clone https://github.com/ipython/ipywidgets
        cd ipywidgets

1. Dev-install of the package (run from repo directory):

        pip install -v -e .

2. Build the Jupyter Widgets package

        cd jupyter-js-widgets
        npm install
        cd ..

3. Install the Jupyter Widgets nbextension

        cd widgetsnbextension
        npm install
        npm run update:widgets
        pip install -v -e .
        cd ..

After you've made changes to `jupyter-js-widgets` and you'd like to test those
changes, run the following, empty your browsers cache, and refresh the page.

        cd widgetsnbextension
        npm run update:widgets
        cd ..

TIPS: If you have any problems with the above install procedure, make sure that
permissions on npm and pip related install directories are correct.  Sometimes
it helps to clear cached files too by running `git clean -dfx`.  Also, when
you make changes to the Javascript, if you're not seeing the changes it could
be your browser caching aggressively.  Try using "incognito" or "private"
browsing tabs to avoid caching.


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
