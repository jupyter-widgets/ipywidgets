#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#

import os
import subprocess
import sys
import sphinx_rtd_theme
import recommonmark.parser


# -- path -------------------------------------------------------

from os.path import dirname
docs = dirname(dirname(__file__))
root = dirname(docs)
sys.path.insert(0, root)


# -- bash utility function --------------------------------------
def bash(filename):
    """Runs a bash script in the local directory"""
    sys.stdout.flush()
    subprocess.call("bash {}".format(filename), shell=True)


# -- source files and parsers -----------------------------------

source_suffix = ['.rst', '.md', '.ipynb']
source_parsers = {
    '.md': recommonmark.parser.CommonMarkParser,
}


# -- Sphinx extensions and configuration ------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'nbsphinx',
    'IPython.sphinxext.ipython_console_highlighting',
]

intersphinx_mapping = {
    'ipython': ('http://ipython.org/ipython-doc/dev/', None),
    'nbconvert': ('https://nbconvert.readthedocs.io/en/latest/', None),
    'nbformat': ('https://nbformat.readthedocs.io/en/latest/', None),
    'jupyter': ('https://jupyter.readthedocs.io/en/latest/', None),
}

nbsphinx_allow_errors = True   # exception ipstruct.py ipython_genutils

# -- RTD and local build instructions -----------------------

on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

if on_rtd:
    print('On RTD, installing node and building...')
    bash('../build-rtd.sh')
else:
    print('Local build not on RTD, building...')

    # set theme; see end of file for theme options
    html_theme = "sphinx_rtd_theme"
    html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
    bash('../build-local.sh')

print('Done bulding')


# -- General information -------

_release = {}
exec(compile(open('../../ipywidgets/_version.py').read(), '../../ipywidgets/_version.py', 'exec'), _release)
version = '.'.join(map(str, _release['version_info'][:2]))
release = _release['__version__']

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

master_doc = 'index'
project = 'ipywidgets and jupyter-js-widgets'
copyright = '2016, Jupyter Team, https://jupyter.org'
author = 'Jupyter Team'

language = None
exclude_patterns = ['_build', '**.ipynb_checkpoints', 'examples/Imag*', 'examples/Index.ipynb']
pygments_style = 'sphinx'
todo_include_todos = False


# -- html --------------------------

html_static_path = ['_static']
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
