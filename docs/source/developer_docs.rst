Developer Docs
===============

The Jupyter widgets packages are developed in the `https://github.com/jupyter-widgets/ipywidgets <https://github.com/jupyter-widgets/ipywidgets>`_ git repository. See the issue tracker, README, and other Github documents for the most recent information.


Scope of ipywidgets
-------------------

``ipywidgets`` is a framework to provide eventful python objects that have a representation in the browser (see :doc:`examples/Widget Basics.ipynb` for more on the definition of widgets). This requires two components:

1. The framework for widget interactions between the widgets represented in the Python kernel and the (javascript) representation of the widgets in the browser.
2. A basic, lightweight set of form controls that *use* this framework, based on standard HTML form controls. These included controls include a text area, text box, select and multiselect controls, checkbox, etc. A few more advanced controls that are very popular are also included, such as a slider and basic tab panels.

The framework for building rich interactive objects is the foremost purpose of the ipywidgets project, and the set of included reference form controls is purposefully kept small and self-contained to serve as something like a reference implementation. We encourage and support a robust ecosystem of packages built on top of the ipywidgets framework to provide more complicated interactive objects, such as maps or 2d and 3d visualizations, or other form control systems built on a variety of popular Javascript frameworks such as Material or Vue.


Additional Developer Docs
-------------------------

.. toctree::
   :maxdepth: 3

   dev_install.md
   dev_testing.md
   dev_docs
   dev_release.md
