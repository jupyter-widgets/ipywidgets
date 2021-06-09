#!/usr/bin/env python3
#


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


# prolog based on https://github.com/spatialaudio/nbsphinx/blob/98005a9d6b331b7d6d14221539154df69f7ae51a/doc/conf.py#L38
nbsphinx_prolog = r"""
{% set docname_link = env.doc2path(env.docname, base=None).replace(' ', '%20') %}
{% set docname_display = env.doc2path(env.docname, base=None) %}

.. raw:: html

    <div class="admonition note">
      This page was generated from
      <a class="reference external" href="https://github.com/jupyter-widgets/ipywidgets/blob/{{ env.config.release|e }}/docs/source/{{ docname_link|e }}">{{ docname_display|e }}</a>.<br>
      Interactive online version:
      <span style="white-space: nowrap;"><a href="https://mybinder.org/v2/gh/jupyter-widgets/ipywidgets/{{ env.config.release|e }}?urlpath=lab/tree/docs/source/{{ docname_link|e }}"><img alt="Binder badge" src="https://mybinder.org/badge_logo.svg" style="vertical-align:text-bottom"></a>.</span>
    </div>

.. raw:: latex

    \nbsphinxstartnotebook{\scriptsize\noindent\strut
    \textcolor{gray}{The following section was generated from
    \sphinxcode{\sphinxupquote{\strut {{ docname | escape_latex }}}} \dotfill}}
"""

nbsphinx_execute = 'always'

# -- General information -------

_release = {}
exec(compile(open('../../ipywidgets/_version.py').read(), '../../ipywidgets/_version.py', 'exec'), _release)
from packaging.version import Version
v = Version(_release['__version__'])
version = f'{v.major}.{v.minor}'
release = _release['__version__']

# Add any paths that contain templates here, relative to this directory.
# templates_path = ['_templates']

master_doc = 'index'
project = 'Jupyter Widgets'
copyright = '2017-2021 Project Jupyter'
author = 'Jupyter Team'

language = None
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
html_theme_options = {
    # Toc options
    'collapse_navigation': True,
    'sticky_navigation': True,
    'navigation_depth': 2,
    'includehidden': True,
    'titles_only': False
}
