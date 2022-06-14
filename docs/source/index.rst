Jupyter Widgets
===============

.. only:: html

    :Release: |release|
    :Date: |today|

Jupyter Widgets are `interactive browser controls
<https://github.com/jupyter-widgets/ipywidgets/blob/master/docs/source/examples/Index.ipynb>`_
for Jupyter notebooks. Examples include:

* Basic form controls like sliders, checkboxes, text inputs
* Container controls like tabs, accordions, horizontal and vertical layout boxes, grid layouts
* Advanced controls like maps, 2d and 3d visualizations, datagrids, and more

Notebooks come alive when interactive widgets are used. Users can visualize and
manipulate their data in intuitive and easy ways.  Researchers can easily see
how changing inputs to a model impact the results. Scientists can share
interactive results with graphical user interfaces that others can play with
without seeing code. Exploring, learning, and sharing becomes a fun immersive
experience.

.. todo: Add screenshot

Core Jupyter Widgets
--------------------

Jupyter Widgets is primarily a framework to provide interactive controls (see
:doc:`examples/Widget Basics` for more information). The ``ipywidgets`` package
also provides a basic, lightweight set of core form controls that *use* this
framework. These included controls include a text area, text box, select and
multiselect controls, checkbox, sliders, tab panels, grid layout, etc.

The framework for building rich interactive objects is the foremost purpose of
the Jupyter Widgets project, and the set of included core form controls is
purposefully kept small and self-contained. We encourage and support a robust
ecosystem of packages built on top of the Jupyter Widgets framework to provide
more complicated interactive objects, such as maps, 2d and 3d visualizations, or
other form control systems built on a variety of popular Javascript frameworks
such as Material or Vue.

See the `Jupyter Widgets wiki page
<https://github.com/jupyter/jupyter/wiki/Jupyter-Widgets>`_ for more information
about custom widget packages built on top of the Jupyter Widgets framework.

Jupyter Widgets components
--------------------------

The Jupyter Widgets framework has several components:

1. A package in the kernel to provide an interface for widgets. The
   ``ipywidgets`` Python package provides Jupyter Widgets for the IPython
   kernel. Other kernels may also provide Jupyter Widgets support.
2. An extension for the browser Jupyter frontend to manage Jupyter Widgets.
   Installing ``ipywidgets`` automatically installs extensions for JupyterLab
   and Jupyter Notebook (the ``jupyterlab-widgets`` and ``widgetsnbextension``
   packages). The Jupyter Widgets project also maintains a plain HTML interface
   for embedding Jupyter Widgets on a webpage, and many other frontends support
   Jupyter Widgets.

See the `Jupyter Widgets wiki
page <https://github.com/jupyter/jupyter/wiki/Jupyter-Widgets>`_ for more
information from the community about kernels and frontends that support Jupyter Widgets, as well as 
some custom widget packages built on top of the Jupyter Widgets framework.

.. toctree::
    :maxdepth: 2

    user_install.md
    examples/Widget Basics.ipynb
    examples/Widget List.ipynb
    examples/Output Widget.ipynb
    examples/Widget Events.ipynb
    examples/Widget Styling.ipynb
    examples/Layout Templates.ipynb
    examples/Widget Custom.ipynb
    examples/Using Interact.ipynb
    examples/Widget Low Level.ipynb
    examples/Widget Asynchronous.ipynb
    embedding.md

.. toctree::
   :caption: Changelog and Migration
   :maxdepth: 1

   changelog.md
   migration_guides.md

.. toctree::
   :caption: Developer Guide
   :maxdepth: 1

   dev_install.md
   dev_testing.md
   dev_docs.md
   contributing.md
   dev_release.md

.. only:: html

  * :ref:`genindex`
  * :ref:`modindex`
  * :ref:`search`
