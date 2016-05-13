Developer Install
=================
To install ipywidgets from git, **you will need [npm](https://www.npmjs.com/) version 3.x or later** (check you version by running `npm -v` from a terminal) and
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

1. Navigate into the cloned repo and install

        cd ipywidgets
        bash dev-install.sh

After you've made changes to `jupyter-js-widgets` if you want to test those
changes, run the following, empty your browsers cache, and refresh the page.

        cd widgetsnbextension
        npm run update
        cd ..

TIPS: If you have any problems with the above install procedure, make sure that
permissions on npm and pip related install directories are correct.  Sometimes
it helps to clear cached files too by running `git clean -dfx`.  Also, when
you make changes to the Javascript, if you're not seeing the changes it could
be your browser is caching aggressively.  Try using "incognito" or "private"
browsing tabs to avoid caching.
