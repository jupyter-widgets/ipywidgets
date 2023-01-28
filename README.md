# ipywidgets: Interactive HTML Widgets

| Purpose                         | Badges                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Latest (`main`: future 8.0)** | [![Test Status](https://github.com/jupyter-widgets/ipywidgets/actions/workflows/tests.yml/badge.svg?query=branch%3Amain)](https://github.com/jupyter-widgets/ipywidgets/actions?query=branch%3Amain) [![Documentation Status: latest](https://img.shields.io/readthedocs/ipywidgets?logo=read-the-docs)](https://ipywidgets.readthedocs.io/en/latest/?badge=latest) [![Binder:main](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyter-widgets/ipywidgets/main?urlpath=lab/tree/docs%2Fsource%2Fexamples)                                             |
| **Stable**                      | [![Version](https://img.shields.io/pypi/v/ipywidgets.svg?logo=pypi)](https://pypi.python.org/pypi/ipywidgets) [![Conda Version](https://img.shields.io/conda/vn/conda-forge/ipywidgets.svg?logo=conda-forge)](https://anaconda.org/conda-forge/ipywidgets) [![Documentation Status](https://img.shields.io/readthedocs/ipywidgets?logo=read-the-docs)](https://ipywidgets.readthedocs.io/en/stable/?badge=stable) [![Binder:7.x](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyter-widgets/ipywidgets/7.x?urlpath=lab/tree/docs%2Fsource%2Fexamples) |
| **Communication**               | [![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jupyter-widgets/Lobby) [![Discourse](https://img.shields.io/badge/help_forum-discourse-blue?logo=discourse)](https://discourse.jupyter.org/c/widgets/46)                                                                                                                                                                                                                                                                                             |
|                                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**ipywidgets**, also known as jupyter-widgets or simply widgets, are
[interactive HTML widgets](https://github.com/jupyter-widgets/ipywidgets/blob/main/docs/source/examples/Index.ipynb)
for Jupyter notebooks and the IPython kernel.

Notebooks come alive when interactive widgets are used. Users gain control of
their data and can visualize changes in the data.

Learning becomes an immersive, fun experience. Researchers can easily see
how changing inputs to a model impact the results. We hope you will add
ipywidgets to your notebooks, and we're here to help you get started.

## Core Interactive Widgets

The fundamental widgets provided by this library are called core interactive
widgets. A [demonstration notebook](https://github.com/jupyter-widgets/ipywidgets/blob/main/docs/source/examples/Index.ipynb)
provides an overview of the core interactive widgets, including:

- sliders
- progress bars
- text boxes
- toggle buttons and checkboxes
- display areas
- and more

## Jupyter Interactive Widgets as a Framework

Besides the widgets already provided with the library, the framework can be
extended with the development of **custom widget libraries**. For detailed
information, please refer to the [ipywidgets documentation](https://ipywidgets.readthedocs.io/en/latest/).

### Cookiecutter template for custom widget development

A template project for building custom widgets is available as a
[**cookiecutter**](https://github.com/jupyter-widgets/widget-ts-cookiecutter).
This cookiecutter project helps custom widget authors get started with the
packaging and the distribution of their custom Jupyter interactive widgets.
The cookiecutter produces a project for a Jupyter interactive widget library
following the current best practices for using interactive widgets. An
implementation for a placeholder "Hello World" widget is provided as an example.

Popular widget libraries such as
[bqplot](https://github.com/bqplot/bqplot),
[pythreejs](https://github.com/jupyter-widgets/pythreejs) and
[ipyleaflet](https://github.com/jupyter-widgets/ipyleaflet)
follow exactly the same template and directory structure. They serve as
more advanced examples of usage of the Jupyter widget infrastructure.

### Popular custom widget examples

Examples of custom widget libraries built upon ipywidgets are

- [bqplot](https://github.com/bqplot/bqplot) a 2d data visualization library
  enabling custom user interactions.
- [pythreejs](https://github.com/jupyter-widgets/pythreejs) a Jupyter - Three.js wrapper,
  bringing Three.js to the notebook.
- [ipyleaflet](https://github.com/jupyter-widgets/ipyleaflet) a leaflet widget for Jupyter.

## Install

The stable version of ipywidgets can be installed with pip or conda.

With pip:

```sh
pip install ipywidgets
```

With conda:

```sh
conda install -c conda-forge ipywidgets
```

### Developer install from source

Installing from source is more complicated and requires a developer install,
see the detailed [developer install](docs/source/dev_install.md) instructions.

If you want to install ipywidgets from source, **you will need the
[yarn](https://yarnpkg.com/) package manager version 1.2.1 or later**.
To install the latest `main` version from the root directory of the source
code, run `dev-install.sh`. To only build the Python package enter
`pip install -e .`.

## Usage

See the [examples](docs/source/examples.md) section of the documentation. The widgets are being used in a variety of ways; some uses can be seen in these notebooks:
[Demo notebook of interactive widgets](https://github.com/jupyter-widgets/ipywidgets/blob/main/docs/source/examples/Index.ipynb)

## Change log

[Change log](docs/source/changelog.md)

### Version Compatibility with Front-End Clients

Refer to change log for more detail.

| ipywidgets | JupyterLab | [Classic Notebook](https://github.com/jupyter/notebook) | [nbclassic](https://github.com/jupyterlab/nbclassic) |
| ---------- | :--------: | :-----------------------------------------------------: | :--------------------------------------------------: |
| `main`     |            |                            -                            |                         TBD                          |
| `7.6.3`    |            |                                                         |                        0.2.6                         |
| **Legacy** |            |                                                         |                                                      |
| `6.x`      |            |                                                         |                          -                           |
| `5.x`      |            |                           4.2                           |                          -                           |
| `4.1.x`    |            |                           4.1                           |                          -                           |
| `4.0.x`    |            |                           4.0                           |                          -                           |

## Contributing to ipywidgets

[Developer information](CONTRIBUTING.md)

## License

We use a shared copyright model that enables all contributors to maintain the
copyright on their contributions.

See the [LICENSE](LICENSE) file in this repository for details.

## Project Jupyter resources

- [Project Jupyter website](https://jupyter.org)
- [Online Demo at try.jupyter.org](https://try.jupyter.org)
- [Documentation for Project Jupyter](https://jupyter.readthedocs.io/en/latest/index.html) [[PDF](https://media.readthedocs.org/pdf/jupyter/latest/jupyter.pdf)]
- [![Discourse](https://img.shields.io/badge/help_forum-discourse-blue?logo=discourse)](https://discourse.jupyter.org/)
  [![Google Group](https://img.shields.io/badge/-Google%20Group-lightgrey.svg)](https://groups.google.com/forum/#!forum/jupyter)

## [Weekly Team Meetings](https://github.com/jupyter-widgets/team-compass/issues/1)

Developer Meetings take place on [zoom](https://zoom.us/my/jovyan?pwd=c0JZTHlNdS9Sek9vdzR3aTJ4SzFTQT09), on Tuesdays at 9:30AM Pacific Time ([your time](https://www.thetimezoneconverter.com/?t=9%3A30%20am&tz=San%20Francisco)).

Minutes are taken at [Hackmd.io](https://hackmd.io/5XWHyOoLTRqyXzEHsVmxXg).
