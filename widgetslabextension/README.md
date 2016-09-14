Jupyter Widgets JupyterLab Extension
====================================

A JupyterLab extension for Jupyter/IPython widgets.

Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)
- [python](https://www.continuum.io/downloads)

```bash
npm install --save jupyter-js-widgets-labextension
conda install notebook  # notebook 4.2+ required
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node 0.12+](http://nodejs.org/)
- [python](https://www.continuum.io/downloads)

```bash
git clone https://github.com/ipython/ipywidgets.git
cd ipywidgets/labextension
npm install
npm run build
conda install notebook  # notebook 4.2+ required
```


**Rebuild**
```bash
npm run clean
npm run build
```

Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.
