#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
import sys
import os
import shlex
from recommonmark.parser import CommonMarkParser
import sphinx_bootstrap_theme
import subprocess

print "Building JS..."
sys.stdout.flush()
try:
    subprocess.call("bash ../build.sh", shell=True)
finally:
    print "Done building JS"

source_parsers = {
    '.md': CommonMarkParser,
}

_release = {}
exec(compile(open('../../ipywidgets/_version.py').read(), '../../ipywidgets/_version.py', 'exec'), _release)

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'nbsphinx'
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# The suffix(es) of source filenames.
# You can specify multiple suffix as a list of string:
source_suffix = ['.rst', '.md', '.ipynb']

# The master toctree document.
master_doc = 'index'

# General information about the project.
project = 'ipywidgets and jupyter-js-widgets'
copyright = '2016, Jupyter Team, https://jupyter.org'
author = 'Jupyter Team'

version = '.'.join(map(str, _release['version_info'][:2]))
# The full version, including alpha/beta/rc tags.
release = _release['__version__']

language = None

exclude_patterns = []

#
pygments_style = 'sphinx'

# If true, `todo` and `todoList` produce output, else they produce nothing.
todo_include_todos = False

# Output file base name for HTML help builder.
htmlhelp_basename = 'ipywidgetsdoc'

# -- Options for LaTeX output ---------------------------------------------

latex_elements = {

}

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
latex_documents = [
  (master_doc, 'ipywidgets.tex', 'ipywidgets Documentation',
   'https://jupyter.org', 'manual'),
]

# Grouping the document tree into Texinfo files. List of tuples
# (source start file, target name, title, author,
#  dir menu entry, description, category)
texinfo_documents = [
  (master_doc, 'ipywidgets', 'ipywidgets Documentation',
   author, 'ipywidgets', 'One line description of project.',
   'Miscellaneous'),
]

# -- Options for Epub output ----------------------------------------------

# Bibliographic Dublin Core info.
epub_title = project
epub_author = author
epub_publisher = author
epub_copyright = copyright


# Example configuration for intersphinx: refer to the Python standard library.
intersphinx_mapping = {
    'ipython': ('http://ipython.org/ipython-doc/dev/', None),
    'nbconvert': ('http://nbconvert.readthedocs.org/en/latest/', None),
    'nbformat': ('http://nbformat.readthedocs.org/en/latest/', None),
    'jupyter': ('http://jupyter.readthedocs.org/en/latest/', None),
}

# on_rtd is whether we are on readthedocs.org, this line of code grabbed from docs.readthedocs.org
# on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

html_theme = 'bootstrap'
html_theme_path = sphinx_bootstrap_theme.get_html_theme_path()
html_static_path = ['_static']
html_sidebars = {
    '**': [
        'sidebartoc.html'
    ]
}

# html_short_title = "Home"
#
#
# Theme options are theme-specific and customize the look and feel of a
# theme further.
html_theme_options = {
    # Navigation bar title. (Default: ``project`` value)
    'navbar_title': "ipywidgets and jupyter-js-widgets",

    # Tab name for entire site. (Default: "Site")
    'navbar_site_name': "Site",

    # A list of tuples containing pages or urls to link to.
    # Valid tuples should be in the following forms:
    #    (name, page)                 # a link to a page
    #    (name, "/aa/bb", 1)          # a link to an arbitrary relative url
    #    (name, "http://example.com", True) # arbitrary absolute url
    # Note the "1" or "True" value above as the third argument to indicate
    # an arbitrary url.
    'navbar_links': [
    ],

    # Render the next and previous page links in navbar. (Default: true)
    'navbar_sidebarrel': True,

    # Render the current pages TOC in the navbar. (Default: true)
    'navbar_pagenav': False,

    # Tab name for the current pages TOC. (Default: "Page")
    'navbar_pagenav_name': "Page",

    # Global TOC depth for "site" navbar tab. (Default: 1)
    # Switching to -1 shows all levels.
    'globaltoc_depth': 2,

    # Include hidden TOCs in Site navbar?
    #
    # Note: If this is "false", you cannot have mixed ``:hidden:`` and
    # non-hidden ``toctree`` directives in the same page, or else the build
    # will break.
    #
    # Values: "true" (default) or "false"
    'globaltoc_includehidden': "true",

    # HTML navbar class (Default: "navbar") to attach to <div> element.
    # For black navbar, do "navbar navbar-inverse"
    'navbar_class': "navbar navbar-inverse",

    # Fix navigation bar to top of page?
    # Values: "true" (default) or "false"
    'navbar_fixed_top': "true",

    # Location of link to source.
    # Options are "nav" (default), "footer" or anything else to exclude.
    'source_link_position': "none",

    # Bootswatch (http://bootswatch.com/) theme.
    #
    # Options are nothing (default) or the name of a valid theme
    # such as "amelia" or "cosmo".
    'bootswatch_theme': "yeti",

    # Choose Bootstrap version.
    # Values: "3" (default) or "2" (in quotes)
    'bootstrap_version': "3",
}
