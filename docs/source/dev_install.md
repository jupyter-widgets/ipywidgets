Developer Install
=================
To install ipywidgets from git, you will need [npm](https://www.npmjs.com/) and
the latest [development copy of the Jupyter
notebook](https://github.com/jupyter/notebook) because everything in the
ipywidgets repository is developed using Jupyter notebook master. If you want
to have a copy of ipywidgets that works against a stable version of the
notebook, checkout the appropriate tag (see the
[Compatibility table](https://github.com/ipython/ipywidgets#compatibility)).

NOTE: If you install using sudo, you need to make sure that npm is also
available in the PATH used with sudo.

0. Clone the repo:

        git clone https://github.com/ipython/ipywidgets

1. Build the Jupyter Widgets package

        cd jupyter-js-widgets
        npm install
        cd ..

2. Install the Jupyter Widgets nbextension

        cd widgetsnbextension
        npm install
        npm run update:widgets
        pip install -v -e .
        cd ..
        jupyter nbextension install --py --symlink --user widgetsnbextension
        jupyter nbextension enable --py --user widgetsnbextension

3. Dev-install of the package (run from ipywidgets repo directory):

        cd ipywidgets
        pip install -v -e .


After you've made changes to `jupyter-js-widgets` if you want to test those
changes, run the following, empty your browsers cache, and refresh the page.

        cd widgetsnbextension
        npm run update:widgets
        cd ..

TIPS: If you have any problems with the above install procedure, make sure that
permissions on npm and pip related install directories are correct.  Sometimes
it helps to clear cached files too by running `git clean -dfx`.  Also, when
you make changes to the Javascript, if you're not seeing the changes it could
be your browser is caching aggressively.  Try using "incognito" or "private"
browsing tabs to avoid caching.
