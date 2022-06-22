#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# -- source files and parsers -----------------------------------

source_suffix = {
    '.rst': 'restructuredtext',
    '.md': 'markdown',
}


# -- Sphinx extensions and configuration ------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'nbsphinx',
    'IPython.sphinxext.ipython_console_highlighting',
    'recommonmark',
]

intersphinx_mapping = {
    'ipython': ('http://ipython.org/ipython-doc/dev/', None),
    'nbconvert': ('https://nbconvert.readthedocs.io/en/latest/', None),
    'nbformat': ('https://nbformat.readthedocs.io/en/latest/', None),
    'jupyter': ('https://jupyter.readthedocs.io/en/latest/', None),
}

nbsphinx_execute = 'always'

# -- General information -------

_release = {}
exec(compile(open('../../ipywidgets/_version.py').read(), '../../ipywidgets/_version.py', 'exec'), _release)
version = '.'.join(map(str, _release['version_info'][:2]))
release = _release['__version__']

# Add any paths that contain templates here, relative to this directory.
# templates_path = ['_templates']

master_doc = 'index'
project = 'Jupyter Widgets'
copyright = '2017-2022 Project Jupyter'
author = 'Jupyter Team'

language = "en"
exclude_patterns = [
    '**.ipynb_checkpoints',
    'examples.md',
    'examples/Beat Frequencies.ipynb',
    'examples/Controller.ipynb',
    'examples/Exploring Graphs.ipynb',
    'examples/Export As (nbconvert).ipynb',
    'examples/Factoring.ipynb',
    'examples/Imag*',
    'examples/Index.ipynb',
    'examples/Lorenz Differential Equations.ipynb',
    'examples/Media widgets.ipynb',
    'examples/Variable Inspector.ipynb',
    'examples/Widget Alignment.ipynb',
]
pygments_style = 'sphinx'
todo_include_todos = False


# -- html --------------------------
html_theme = 'sphinx_rtd_theme'

# html_static_path = ['_static']
htmlhelp_basename = 'ipywidgetsdoc'


# -- latex -------------------------

latex_elements = {}
latex_documents = [
  (master_doc, 'ipywidgets.tex', 'ipywidgets Documentation',
   'https://jupyter.org', 'manual'),
]


# -- tex ---------------------------

texinfo_documents = [
  (master_doc, 'ipywidgets', 'ipywidgets Documentation',
   author, 'ipywidgets', 'One line description of project.',
   'Miscellaneous'),
]


# -- epub --------------------------

# Bibliographic Dublin Core info.
epub_title = project
epub_author = author
epub_publisher = author
epub_copyright = copyright


# -- Theme options -----------------

# Options are theme-specific and customize the look and feel of the theme.
html_theme_options = {}
