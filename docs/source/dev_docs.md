# Develop and Build Documentation

To build the documentation you'll need [Sphinx](http://www.sphinx-doc.org/)
and a few other packages.

## Setup docs dev environment

### Use pip

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

### Use conda

First create a [conda environment](http://conda.pydata.org/docs/using/envs.html#use-environment-from-file) named `ipywidgets_docs` to install all the necessary packages:

```bash
# create the environment
conda create -n ipywidgets_docs -c conda-forge python pip
```

Use conda to install the packages listed in `docs/requirements.txt`.

Then, activate the conda environment.

```bash
# activate the environment
conda activate ipywidgets_docs   # Linux and OS X
activate ipywidgets_docs         # Windows
```

## Build the documentation

Once you have installed the required packages, you can build the docs with:

```bash
cd docs
make clean
make html
```

After that, the generated HTML files will be available at
`build/html/index.html`. You may view the docs in your browser by entering
the following in the terminal: `open build/html/index.html`. Alternatively,
you can start a webserver using `python3 -m http.server` and navigate to
<http://localhost:8000/build/html/index.html>.

Windows users can find `make.bat` in the `docs` folder.

You should also have a look at the [Project Jupyter Documentation Guide](https://jupyter.readthedocs.io/en/latest/contrib_docs/index.html).

## Cleaning notebook output for docs

When using notebook source files to generate documentation, it's good practice to strip
notebook output and metadata with [nbstripout](https://github.com/kynan/nbstripout)
before committing the notebook. For example, the following command will strip
all output from a notebook:

```bash
nbstripout docs/source/examples/Widget\ List.ipynb
```
