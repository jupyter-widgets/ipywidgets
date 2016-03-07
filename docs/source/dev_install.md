Developer Install
=================

<script>
w({
  "e43a868c5c0b4db39f0416d0fe9cc476": {
    "model_name": "IntSliderModel",
    "model_module": null,
    "state": {
      "_model_name": "IntSliderModel",
      "_view_name": "FloatSliderView",
      "description": "testtesttesttesttesttesttesttesttesttest",
       "min": 0,
      "max": 4,
      "value": 0,
      "step": 0.3333333333333333
    }
  }
});
</script>

<script>
w({
  "e43a868c5c0b4db39f0416d0fe9cc476": null
});
</script>

To install ipywidgets from git, you will need [npm](https://www.npmjs.com/) and
the latest [development copy of the Jupyter
notebook](https://github.com/jupyter/notebook) because everything in the
ipywidgets repository is developed using Jupyter notebook master. If you want
to have a copy of ipywidgets that works against a stable version of the
notebook, checkout the appropriate tag (see the Compatibility table above).

If you install using sudo, you need to make sure that npm is also
available in the PATH used with sudo.

0. clone the repo:

        git clone https://github.com/ipython/ipywidgets
        cd ipywidgets

1. Dev-install of the package (run from repo directory):

        pip install -v -e .

2. Build the Jupyter Widgets package

        cd jupyter-js-widgets
        npm install
        cd ..

3. Install the Jupyter Widgets nbextension

        cd widgetsnbextension
        npm install
        npm run update:widgets
        pip install -v -e .
        cd ..

After you've made changes to `jupyter-js-widgets` and you'd like to test those
changes, run the following, empty your browsers cache, and refresh the page.

        cd widgetsnbextension
        npm run update:widgets
        cd ..

TIPS: If you have any problems with the above install procedure, make sure that
permissions on npm and pip related install directories are correct.  Sometimes
it helps to clear cached files too by running `git clean -dfx`.  Also, when
you make changes to the Javascript, if you're not seeing the changes it could
be your browser caching aggressively.  Try using "incognito" or "private"
browsing tabs to avoid caching.
