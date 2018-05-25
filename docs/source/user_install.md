Installation
============

Users can install the current version of **ipywidgets** with
[pip](https://pip.pypa.io/en/stable/) or
[conda](https://conda.readthedocs.io/en/latest/).

With pip
--------

``` bash
pip install ipywidgets
jupyter nbextension enable --py widgetsnbextension
```

When using [virtualenv](https://virtualenv.pypa.io/en/stable/) and working in
an activated virtual environment, the ``--sys-prefix`` option may be required
to enable the extension and keep the environment isolated (i.e.
``jupyter nbextension enable --py widgetsnbextension --sys-prefix``).

With conda
----------

``` bash
conda install -c conda-forge ipywidgets
```

Installing **ipywidgets** with conda will also enable the extension for you.

Installing with multiple environments
-------------------------------------

Sometimes the Jupyter Notebook and the IPython kernel are installed in different
environments (either virtualenv or conda environments).
This happens when environments are used to
provide different IPython kernels. In this case, the installation requires two steps.

First, you need to install the `widgetsnbextension` package in the environment
containing the Jupyter Notebook server. Next, you need to install 
`ipywidgets` in each kernel's environment that will use ipywidgets.

For example, if using conda environments, with the notebook installed on the 
`base` environment and the kernel installed in an environment called `py36`,
the commands are:

```bash
conda install -n base -c conda-forge widgetsnbextension
conda install -n py36 -c conda-forge ipywidgets

```

Installing the JupyterLab Extension
-----------------------------------

To install the JupyterLab extension you also need to run the command below in
a terminal which requires that you have [nodejs](https://nodejs.org/en/)
installed.
```bash
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

This command defaults to installing the latest version of the **ipywidgets**
JupyterLab extension. Depending on the version of JupyterLab you have installed, you 
may need to install [an older version](https://github.com/jupyter-widgets/ipywidgets/tree/master/packages/jupyterlab-manager#version-compatibility).

**Note:** A clean reinstall of the JupyterLab extension can be done by first
running the `jupyter lab clean` command which will remove the staging and
static directories from the lab directory. The location of the lab directory
can be queried by executing the command `jupyter lab path` in your terminal.

Frequently Asked Questions
--------------------------

The issues in the [Reference milestone](https://github.com/jupyter-widgets/ipywidgets/issues?q=is%3Aopen+is%3Aissue+milestone%3AReference) on GitHub include many questions, discussions,
and answers about ipywidgets.

**Question**: When I display a widget or interact, I just see some text, such as `IntSlider(value=0)` or `interactive(children=(IntSlider(value=0, description='x', max=1), Output()), _dom_classes=('widget-interact',))`. What is wrong?

**Answer**: A text representation of the widget is printed if the widget control
is not available. It may mean the widget JavaScript is still loading. If the
message persists in the Jupyter Notebook or JupyterLab, it likely means that the
widgets JavaScript library is either not installed or not enabled. See the
installation instructions above for setup instructions.

If you see this message in another frontend (for example, a static rendering on
GitHub or <a href="https://nbviewer.jupyter.org/">NBViewer</a>), it may mean
that your frontend doesn't currently support widgets.
