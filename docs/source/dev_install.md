Developer Install
=================

Prerequisites
-------------

To install ipywidgets from git, you will need:

- [npm](https://www.npmjs.com/) **version 3.x or later**
  + Check your version by running `npm -v` from a terminal.
  + *Note: If you install using sudo, you need to make sure that npm is also
    available in the PATH used with sudo.*


- the latest [Jupyter notebook development release](https://github.com/jupyter/notebook)
  + Everything in the ipywidgets repository is developed using Jupyter 
    notebook's master branch. 
  + If you want to have a copy of ipywidgets that works against a stable
    version of the notebook, checkout the appropriate tag.
  + See the
    [Compatibility table](https://github.com/ipython/ipywidgets#compatibility).

Steps
-----

0. Clone the repo:

        git clone https://github.com/ipython/ipywidgets

1. Navigate into the cloned repo and install:

        cd ipywidgets
        bash dev-install.sh --sys-prefix

Rebuild after making changes
----------------------------

After you've made changes to `jupyter-js-widgets` if you want to test those
changes, run the following commands, empty your browser's cache, and refresh
the page:

        cd widgetsnbextension
        npm run update
        cd ..

Tips and troubleshooting
------------------------

- If you have any problems with the above install procedure, make sure that
permissions on npm and pip related install directories are correct.

- Sometimes, it helps to clear cached files too by running `git clean -dfx`
  from the root of the cloned repository.

- When you make changes to the Javascript and you're not seeing the changes,
 it could be your browser is caching aggressively. Try clearing the browser's
 cache. Try also using "incognito" or "private" browsing tabs to avoid
 caching.

- If troubleshooting an upgrade and its build, you may need to do the
  following process:
  
    - Deep clean of the cloned repository:
    
      ```
      git clean -dfx .
      ```

    - Remove anything with `widgetsnbextension` in the name of files within
        the `conda` directory

    - Try reinstalling ipywidgets
    
Releasing new versions
----------------------

See [dev_release.md](dev_release.md) for a details on how to release new versions of ipywidgets to PyPI and jupyter-js-widgets on npm. 

Testing
-------

See [dev_testing.md](dev_testing.md) for a details on how to run Python and Javascript tests. 

Building documentation
----------------------

See [dev_docs.md](dev_docs.md) for a details on how to build the docs. 
