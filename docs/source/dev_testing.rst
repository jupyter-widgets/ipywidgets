
Testing
=======

Running Python tests
--------------------

To run the Python tests:

.. code-block:: bash

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

Running the Javascript tests
-----------------------------

To run the Javascript tests:

.. code-block:: bash

    npm run buildtests; python -m ipywidgets.jstest

To run the Javascript tests with all output printed:

.. code-block:: bash

    npm run buildtests; python -m ipywidgets.jstest -- --logall

Description of jstest additional arguments:

    logall - If there is atleast one failure in the notebook, log information for every cell.
    logsuccess - Log information for every cell in the notebook, regardless of failure.