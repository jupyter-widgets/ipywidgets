Jupyter Widgets JupyterLab Extension
====================================

A JupyterLab extension for Jupyter/IPython widgets.

Package Install
---------------

**Prerequisites**

* JupyterLab (see package.json for appropriate version, currently [JupyterLab 1.0](https://github.com/jupyterlab/jupyterlab/releases/tag/v1.0.2))


```bash
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

### Version compatibility

Use the appropriate command from the following list to install a compatible
JupyterLab extension.

* For JupyterLab 1.0.x and 1.1.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@1.0`
* For JupyterLab 1.2.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@1.1`
* For JupyterLab 2.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@2.0`

Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/jupyter-widgets/ipywidgets.git
cd ipywidgets/packages/jupyterlab-manager
npm install
npm run build
jupyter labextension link .
```

**Rebuild**

If you want to pull in changes to Jupyter widgets, run `npm run build` at the ipywidgets repo root to update the version of Jupyter widgets in the `node_modules` directory and rebuild the JupyterLab extension.
