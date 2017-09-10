Jupyter Widgets JupyterLab Extension
====================================

A JupyterLab extension for Jupyter/IPython widgets.  Since JupyterLab is in its
pre-release stage, this package integrating widgets into JupyterLab should also
be considered experimental.

Package Install
---------------

**Prerequisites**
* JupyterLab (see package.json for appropriate version, currently [JupyterLab 0.27.0](https://github.com/jupyterlab/jupyterlab/releases/tag/v0.27.0))


```bash
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/jupyter-widgets/ipywidgets.git
cd packages/jupyterlab-manager
npm install
npm run build
jupyter labextension link .
```

**Rebuild**

If you want to pull in changes to Jupyter widgets, run `npm run build` at the ipywidgets repo root to update the version of Jupyter widgets in the node_modules directory and rebuild the JupyterLab extension.