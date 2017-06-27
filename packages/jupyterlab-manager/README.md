Jupyter Widgets JupyterLab Extension
====================================

A JupyterLab extension for Jupyter/IPython widgets.  Since JupyterLab is in its
pre-release stage, this package integrating widgets into JupyterLab should also
be considered experimental.

Package Install
---------------

**Prerequisites**
* JupyterLab (see package.json for appropriate version)


```bash
jupyter labextension install @jupyterlab/nbwidgets
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/jupyter-widgets/ipywidgets.git
cd ipywidgets/jupyterlab_widgets
npm install
npm run build
jupyter labextension link .
```

**Rebuild**

If you want to pull in changes to Jupyter widgets, first run `npm run update` to update the version of Jupyter widgets in the node_modules directory.

```bash
npm run clean
npm run build
```
