Creating a release
==================

Release a new version of the widgets on PyPI and npm
----------------------------------------------------

#. Checkout ``master`` branch of 
   `ipywidgets repo <https://github.com/ipython/ipywidgets>`_.
#. :command:`cd` into the :file:`ipywidgets` subfolder of the repo root.
#. Then run the following from the command line, replacing the square
   bracketed content with appropriate values:

.. code-block:: bash

    npm version [patch/minor/major]
    npm publish
    git push [upstream master]
    git push [upstream] --tags

**On GitHub:**

#. Go to https://github.com/ipython/ipywidgets/milestones and click **Close**
   for the released version.
#. Make sure patch, minor, and/or major milestones exist as appropriate. If
   not, create the milestone using GitHub's interface.