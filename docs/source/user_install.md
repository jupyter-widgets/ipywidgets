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
