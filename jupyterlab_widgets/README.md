Jupyter Widgets JupyterLab Extension
====================================

A JupyterLab extension for Jupyter/IPython widgets.

Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)
- [python](https://www.continuum.io/downloads)
- Jupyter Notebook 4.2+

```bash
pip install jupyterlab_widgets
jupyter labextension install --sys-prefix --py jupyterlab_widgets
jupyter labextension enable --sys-prefix --py jupyterlab_widgets
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)
- [python](https://www.continuum.io/downloads)
- Jupyter Notebook 4.2+

```bash
git clone https://github.com/ipython/ipywidgets.git
cd ipywidgets/labextension
npm install
npm run build
pip install -e .
jupyter labextension install --sys-prefix --py jupyterlab_widgets
jupyter labextension enable --sys-prefix --py jupyterlab_widgets
```

If you are not on Windows, use the `--symlink` option in the `labextension install`
step so that you don't have to install during rebuilds.

**Rebuild**

If you want to pull in changes to `jupyter-js-widgets`, first run `npm run update` to update the version of `jupyter-js-widgets` in the node_modules directory.

```bash
npm run clean
npm run build
jupyter labextension install --sys-prefix --py jupyterlab_widgets # if you didn't use --symlink above
```

Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.
