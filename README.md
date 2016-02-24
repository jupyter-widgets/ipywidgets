# Interactive HTML Widgets

[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets)
[![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb)
for Jupyter notebooks and the IPython kernel.

A [demonstration notebook](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb) provides an overview of the interactive widgets. For detailed information, please refer to the [ipywidgets documentation](http://ipywidgets.readthedocs.org/en/latest/).

## Install

Install the current version of ipywidgets using pip or conda:

    pip install ipywidgets

or

    conda install ipywidgets

Then run

    jupyter nbextensions install --py --symlink widgetsnbextension
    jupyter nbextensions enable --py --symlink widgetsnbextension

For detailed installation instructions see the [user install](docs/source/user_install.md) document.

#### Compatibility

| ipywidgets version  | Jupyter/notebook version |
| ------------------- | ------------------------ |
| master              | master                   |
| 4.1.x               | 4.1                      |
| 4.0.x               | 4.0                      |

[Change log](docs/source/changelog.md)

## Usage
See the [examples](docs/source/examples.md).

## Developer
- [Developer install](docs/source/dev_install.md)

## Resources
### ipywidgets
- [Demo notebook of interactive widgets](https://github.com/ipython/ipywidgets/blob/master/examples/Index.ipynb)

### Project Jupyter
- [Project Jupyter website](https://jupyter.org)
- [Online Demo of Jupyter Notebook at try.jupyter.org](https://try.jupyter.org)
- [Documentation for Project Jupyter](http://jupyter.readthedocs.org/en/latest/index.html) [[PDF](https://media.readthedocs.org/pdf/jupyter/latest/jupyter.pdf)]
- [![Google Group](https://img.shields.io/badge/-Google%20Group-lightgrey.svg)](https://groups.google.com/forum/#!forum/jupyter)
