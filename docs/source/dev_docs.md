# Develop and Build Documentation

To build the documentation you'll need [Sphinx](https://www.sphinx-doc.org)
and a few other packages.

## Setup documentation environment

### Use `mamba` or `conda` (recommended)

First create a [conda environment](https://conda.pydata.org/docs/using/envs.html#use-environment-from-file) named `ipywidgets_docs` to install all the necessary packages:

```bash
# create the environment
mamba env update --file docs/environment.yml
```

Then, activate the environment.

```bash
# activate the environment
conda activate ipywidgets_docs   # Linux and OS X
activate ipywidgets_docs         # Windows
```

### Use `pip`

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

```{hint}
Building the documentation site requires a working `nodejs` installation, which
can be installed with your package manager of choice, or directly from the
[NodeJS website](https://nodejs.org).
```

## Build the documentation

Once you have installed the required packages, you can build the docs with:

```bash
cd docs/source
sphinx-build -T -E -b html -d ../build/doctrees -D language=en . ../build/html
```

After that, the generated HTML files will be available at
`build/html/index.html`. You may view the docs in your browser by entering
the following in the terminal: `open build/html/index.html`. Alternatively,
you can start the built-in Python web server:

```bash
cd docs/build/html
python3 -m http.server -b 127.0,0.1
```

... and navigate to `http://localhost:8000/`.

You should also have a look at the [Project Jupyter Documentation Guide](https://jupyter.readthedocs.io/en/latest/contrib_docs).

## Watch the documentation

It is also possible to launch a web server which watches the sources and automatically
rebuilds:

```bash
cd docs/source
sphinx-autobuild -T -E -b html -d ../build/doctrees -D language=en . ../build/html
```

... and navigate to `http://localhost:8000/`.

## Cleaning notebook output for docs

When using notebook source files to generate documentation, it's good practice to strip
notebook output and metadata with [nbstripout](https://github.com/kynan/nbstripout)
before committing the notebook. For example, the following command will strip
all output from a notebook:

```bash
nbstripout "docs/source/examples/Widget List.ipynb"
```
