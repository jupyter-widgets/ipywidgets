Developer Docs
===============

The Jupyter widgets packages are developed in the `https://github.com/jupyter-widgets/ipywidgets <https://github.com/jupyter-widgets/ipywidgets>`_ git repository. See the issue tracker, README, and other Github documents for the most recent information.


Scope of Ipywidgets
-------------------

``ipywidgets`` is a framework to provide eventful python objects that have a representation in the browser (see :doc:`examples/Widget Basics.ipynb`for more on the definition of widgets). This requires two components:

1. The framework for widget interactions between the widgets represented in the Python kernel and the (javascript) representation of the widgets in the browser.
2. A set of implemented widgets that *use* this framework.

The framework is the foremost purpose of ipywidgets. ``ipywidgets`` does also provides a set of reference widgets for those objects (and supports them), but these are intentionally relatively lightweight.  Hence ``ipywidgets`` intentionally encourages other browser-level javascript frameworks, as this allows exploration of UI idioms while keeping a shared kernel/Python-level API.


Additional Developer Docs
-------------------------

.. toctree::
   :maxdepth: 3

   dev_install.md
   dev_testing.md
   dev_docs
   dev_release.md
