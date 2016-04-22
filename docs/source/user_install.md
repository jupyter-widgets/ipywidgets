Installation
============

Users can install the current version of **ipywidgets** with **pip** or **conda**.

``` sourceCode
pip install ipywidgets
```

or

``` sourceCode
conda install ipywidgets
```

After **ipywidgets** has been installed, the associated nbextension assets can
be enabled in Jupyter Notebook by running the commands below.
If installing through conda or using virtualenv, the <code>--sys-prefix</code>
parameter may be required to keep the environment isolated.

``` sourceCode
jupyter nbextension enable --py widgetsnbextension
```
