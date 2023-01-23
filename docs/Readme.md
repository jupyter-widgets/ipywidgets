# Building ipywidgets documentation

To build the ipywidgets documentation:

1. Install the development version of ipywidgets with the `dev-install.sh` script in the repo root directory.
2. Install the Python packages for building documentation with either mamba or conda:

   ```sh
   conda env update --file docs/environment.yml
   ```

   or with `pip`:

   ```sh
   python -m pip install -r docs/requirements.txt
   # Also install pandoc separately
   ```

3. Build the HTML docs with sphinx:

   ```sh
   cd docs/source
   python -m sphinx -T -E -b html -d ../build/doctrees -D language=en . ../build/html
   ```

4. Open the documentation from the build directory: `docs/build/html`
