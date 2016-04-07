Testing
=======

To run the Python tests:

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

To run the Javascript tests:

    cd jupyter-js-widgets; npm run test

This will run the test suite using `karma` with 'debug' level logging.
