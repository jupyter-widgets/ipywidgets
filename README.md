# ipywidgets: Interactive HTML Widgets

[![Version](https://img.shields.io/pypi/v/ipywidgets.svg)](https://pypi.python.org/pypi/ipywidgets)
[![Downloads](https://img.shields.io/pypi/dm/ipywidgets.svg)](https://pypi.python.org/pypi/ipywidgets)
[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets)
[![Documentation Status](https://readthedocs.org/projects/ipywidgets/badge/?version=latest)](http://ipywidgets.readthedocs.org/en/latest/?badge=latest)
[![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

ipywidgets are [interactive HTML widgets](https://github.com/ipython/ipywidgets/blob/master/docs/source/examples/Index.ipynb)
for Jupyter notebooks and the IPython kernel.

Notebooks come alive when interactive widgets are used. Users gain control of their data and can visualize changes in the data.

Learning becomes an immersive, plus fun, experience. Researchers can easily see how changing inputs to a model impact the results. We hope you will add ipywidgets to your notebooks, and we're here to help you get started.

## Features
A [demonstration notebook](https://github.com/ipython/ipywidgets/blob/master/docs/source/examples/Index.ipynb) provides an overview of the core interactive widgets, including:

- sliders
- progress bars
- text boxes
- toggle buttons and checkboxes
- display areas
- and more

Besides the widgets already provided with the library, the framework can be
extended with custom widget libraries. Examples of custom widget libraries
built upon ipywidgets are

- [bqplot](https://github.com/bloomberg/bqplot) a 2d data visualization library
  enabling custom user interactions.
- [pythreejs](https://github.com/jovyan/pythreejs) a Jupyter - Three.js wrapper,
  bringing Three.js to the notebook.

The resulting widgets can then be embeded into web pages other than the
Jupyter notebook.

For detailed information, please refer to the [ipywidgets documentation](http://ipywidgets.readthedocs.org/en/latest/).

## Install

Install the current version of ipywidgets using pip or conda:

    pip install ipywidgets

or

    conda install ipywidgets

Then run

    jupyter nbextension enable --py widgetsnbextension

See the [Installation](docs/source/user_install.md) section of the documentation for additional details.

#### Compatibility

| ipywidgets version  | Jupyter/notebook version |
| ------------------- | ------------------------ |
| master              | master                   |
| 4.1.x               | 4.1                      |
| 4.0.x               | 4.0                      |

[Change log](docs/source/changelog.md)

## Usage
See the [examples](docs/source/examples.md) section of the documentation. The widgets are being used in a variety of ways; some uses can be seen in these notebooks:

- [Demo notebook of interactive widgets](https://github.com/ipython/ipywidgets/blob/master/docs/source/examples/Index.ipynb)

## Contributing to ipywidgets
- [Developer install](docs/source/dev_install.md)

### Project Jupyter resources
- [Project Jupyter website](https://jupyter.org)
- [Online Demo of Jupyter Notebook at try.jupyter.org](https://try.jupyter.org)
- [Documentation for Project Jupyter](http://jupyter.readthedocs.org/en/latest/index.html) [[PDF](https://media.readthedocs.org/pdf/jupyter/latest/jupyter.pdf)]
- [![Google Group](https://img.shields.io/badge/-Google%20Group-lightgrey.svg)](https://groups.google.com/forum/#!forum/jupyter)
