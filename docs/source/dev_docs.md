Building the Documentation
==========================

To build the documentation you'll need `Sphinx <http://www.sphinx-doc.org/>`_, `pandoc <http://pandoc.org/>`_
and a few other packages.

To install (and activate) a `conda environment`_ named ``notebook_docs``
containing all the necessary packages (except pandoc), use::

    conda env create -f docs/environment.yml
    source activate notebook_docs  # Linux and OS X
    activate notebook_docs         # Windows

.. _conda environment:
    http://conda.pydata.org/docs/using/envs.html#use-environment-from-file

If you want to install the necessary packages with ``pip`` instead, use
(omitting --user if working in a virtual environment)::

    pip install -r docs/doc-requirements.txt --user

Once you have installed the required packages, you can build the docs with::

    cd docs
    make html

After that, the generated HTML files will be available at
``build/html/index.html``. You may view the docs in your browser.

You can automatically check if all hyperlinks are still valid::

    make linkcheck

Windows users can find ``make.bat`` in the ``docs`` folder.

You should also have a look at the `Project Jupyter Documentation Guide`__.

__ https://jupyter.readthedocs.io/en/latest/contrib_docs/index.html
