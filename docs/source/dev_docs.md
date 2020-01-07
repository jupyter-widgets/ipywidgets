Building the Documentation
==========================

To build the documentation you'll need [Sphinx](http://www.sphinx-doc.org/), [pandoc](http://pandoc.org/)
and a few other packages.

To install (and activate) a [conda environment](http://conda.pydata.org/docs/using/envs.html#use-environment-from-file) named `notebook_docs`
containing all the necessary packages (except pandoc), use:

```
conda env create -f docs/environment.yml
source activate ipywidget_docs  # Linux and OS X
activate ipywidget_docs         # Windows
```

If you want to install the necessary packages with `pip` instead, use
(omitting `--user` if working in a virtual environment):

```
pip install -r docs/requirements.txt --user
```

Once you have installed the required packages, you can build the docs with:

```
cd docs
make clean
make html
```

After that, the generated HTML files will be available at
`build/html/index.html`. You may view the docs in your browser.

You can automatically check if all hyperlinks are still valid::

```
make linkcheck
```

Windows users can find `make.bat` in the `docs` folder.

You should also have a look at the [Project Jupyter Documentation Guide](https://jupyter.readthedocs.io/en/latest/contrib_docs/index.html).

### Cleaning notebooks for docs

Notebook output and metadata should be stripped with [nbstripoutput](https://github.com/kynan/nbstripout) before commiting. For example:
```
nbstripoutput docs/source/examples/Widget\ List.ipynb
```
