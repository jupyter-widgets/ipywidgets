# Jupyter Widgets JupyterLab Extension

A JupyterLab extension for Jupyter/IPython widgets.

## Installation

To enable ipywidgets support in JupyterLab 3.x or 4.x:

```bash
pip install jupyterlab_widgets
```

### Version compatibility

Prior to JupyterLab 3.0, use the appropriate command from the following list
to install a compatible JupyterLab extension.

- For JupyterLab 0.30, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.31`
- For JupyterLab 0.31rc1, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.32`
- For JupyterLab 0.31rc2, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.33`
- For JupyterLab 0.31.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.34`
- For JupyterLab 0.32.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.35`
- For JupyterLab 0.33.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.36`
- For JupyterLab 0.34.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.37`
- For JupyterLab 0.35.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@0.38`
- For JupyterLab 1.0.x and 1.1.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@1.0`
- For JupyterLab 1.2.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@1.1`
- For JupyterLab 2.x, use `jupyter labextension install @jupyter-widgets/jupyterlab-manager@2`

## Contributing

### Development install

Note: You will need Node.js to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_widgets directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

### Uninstall

```bash
pip uninstall jupyterlab_widgets
```
