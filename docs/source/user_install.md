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
jupyter labextension install @jupyterlab/nbwidgets
```

**Note:** A clean reinstall of the JupyterLab extension can be done by first deleting
the lab directory before running the above command. The location of the lab 
directory can be queried by executing `jupyter lab path` in your terminal.

