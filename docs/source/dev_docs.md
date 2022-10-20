# Develop and Build Documentation

To build the documentation you'll need [Sphinx](http://www.sphinx-doc.org/)
and a few other packages.

## Building ipywidgets documentation

### Install development version

Install the development version of ipywidgets with the `dev-install.sh` script in the repo root directory.
```bash
dev-install.sh
```

### Install python packages for building documentation

Install the Python packages for building documentation with `conda`:
   ```bash
   conda env update --file docs/environment.yml 
   ```

   or with `pip`:

   ```bash
   python -m pip install -r docs/requirements.txt
   # Also install pandoc separately
   ```

### Build the HTML

Build the HTML docs with sphinx:
   ```bash
   cd docs/source
   python -m sphinx -T -E -b html -d ../build/doctrees -D language=en . ../build/html
   ```

### View the HTML

Generated HTML files will be available at `docs/build/html/index.html`. 

You may view the docs in your browser by entering the following in the terminal: 
```bash
open docs/build/html/index.html
```

Alternatively, you can start a webserver `python3 -m http.server` and navigate to <http://localhost:8000/build/html/index.html>.

You should also have a look at the [Project Jupyter Documentation Guide](https://jupyter.readthedocs.io/en/latest/contrib_docs/index.html).

## Cleaning notebook output for docs

When using notebook source files to generate documentation, it's good practice to strip
notebook output and metadata with [nbstripout](https://github.com/kynan/nbstripout)
before committing the notebook. For example, the following command will strip
all output from a notebook:

```bash
nbstripout docs/source/examples/Widget\ List.ipynb
```
