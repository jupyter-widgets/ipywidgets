Building the Documentation
==========================

To build the documentation you'll need [Sphinx](http://www.sphinx-doc.org/), [pandoc](http://pandoc.org/)
and a few other packages.

First create a [conda environment](http://conda.pydata.org/docs/using/envs.html#use-environment-from-file) named `ipywidgets_docs` to install all the necessary packages:

```bash
# create the environment
conda create -n ipywidgets_docs -c conda-forge python pip

# activate the environment
conda activate ipywidgets_docs   # Linux and OS X
activate ipywidgets_docs         # Windows
```

Alternatively, it is also possible to create a virtual environment and activate it with the following commands:

```bash
# create the environment
python -m venv .

# activate the environment
source bin/activate
```

In the environment, install the packages:

```bash
python -m pip install -r docs/requirements.txt
```

Once you have installed the required packages, you can build the docs with:

```bash
cd docs
make clean
make html
```

After that, the generated HTML files will be available at
`build/html/index.html`. You may view the docs in your browser.

Windows users can find `make.bat` in the `docs` folder.

You should also have a look at the [Project Jupyter Documentation Guide](https://jupyter.readthedocs.io/en/latest/contrib_docs/index.html).

### Cleaning notebooks for docs

Notebook output and metadata should be stripped with [nbstripoutput](https://github.com/kynan/nbstripout) before commiting. For example:
```
nbstripoutput share/jupyter/notebook_templates/ipywidgets/Widget\ List.ipynb
```
