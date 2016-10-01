#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#

import sphinx_rtd_theme
import os
import subprocess
import sys

on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

def bash(fileName):
    """Runs a bash script in the local directory"""
    sys.stdout.flush()
    subprocess.call("bash {}".format(fileName), shell=True)

# The suffix(es) of source filenames.
# You can specify multiple suffix as a list of string:
source_suffix = ['.rst', '.ipynb']

# Conf.py import settings
source_parsers = {}

def init_theme():
    from recommonmark.parser import CommonMarkParser
    source_parsers['.md'] = CommonMarkParser
    source_suffix.append('.md')

html_theme = "sphinx_rtd_theme"
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'nbsphinx',
    'IPython.sphinxext.ipython_console_highlighting',
]

init_theme()

if on_rtd:
    print('On RTD, installing node and building...')
    bash('../build-rtd.sh')
else:
    print('Not on RTD, building...')
    bash('../build-local.sh')
print('Done bulding')

_release = {}
exec(compile(open('../../ipywidgets/_version.py').read(), '../../ipywidgets/_version.py', 'exec'), _release)

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']
master_doc = 'index'

# General information about the project.
project = 'ipywidgets and jupyter-js-widgets'
copyright = '2016, Jupyter Team, https://jupyter.org'
author = 'Jupyter Team'

version = '.'.join(map(str, _release['version_info'][:2]))
release = _release['__version__']
language = None
exclude_patterns = []
pygments_style = 'sphinx'
todo_include_todos = False
htmlhelp_basename = 'ipywidgetsdoc'

latex_elements = { }
latex_documents = [
  (master_doc, 'ipywidgets.tex', 'ipywidgets Documentation',
   'https://jupyter.org', 'manual'),
]
texinfo_documents = [
  (master_doc, 'ipywidgets', 'ipywidgets Documentation',
   author, 'ipywidgets', 'One line description of project.',
   'Miscellaneous'),
]

# Bibliographic Dublin Core info.
epub_title = project
epub_author = author
epub_publisher = author
epub_copyright = copyright

intersphinx_mapping = {
    'ipython': ('http://ipython.org/ipython-doc/dev/', None),
    'nbconvert': ('http://nbconvert.readthedocs.org/en/latest/', None),
    'nbformat': ('http://nbformat.readthedocs.org/en/latest/', None),
    'jupyter': ('http://jupyter.readthedocs.org/en/latest/', None),
}
html_static_path = ['_static']

# Theme options are theme-specific and customize the look and feel of a
# theme further.
html_theme_options = {}

nbsphinx_allow_errors = True
