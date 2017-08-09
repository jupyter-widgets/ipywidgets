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


Installing the JupyterLab Extension
-----------------------------------

To install the JupyterLab extension you also need to run the below command in
a terminal which requires that you have [nodejs](https://nodejs.org/en/)
installed.
```bash
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

**Note:** A clean reinstall of the JupyterLab extension can be done by first
running the `jupyter lab clean` command which will remove the staging and
static directories from the lab directory. The location of the lab directory
can be queried by executing the command `jupyter lab path` in your terminal.

