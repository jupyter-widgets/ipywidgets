#!/usr/bin/env python
# coding: utf-8

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

# the name of the package
name = 'ipywidgets'

LONG_DESCRIPTION = """
.. image:: https://img.shields.io/pypi/v/ipywidgets.svg
   :target: https://pypi.python.org/pypi/ipywidgets/
   :alt: Version Number

.. image:: https://img.shields.io/pypi/dm/ipywidgets.svg
   :target: https://pypi.python.org/pypi/ipywidgets/
   :alt: Number of PyPI downloads

Interactive HTML Widgets
========================

Interactive HTML widgets for Jupyter notebooks and the IPython kernel.

Usage
=====

.. code-block:: python

    from ipywidgets import IntSlider
    IntSlider()
"""

#-----------------------------------------------------------------------------
# Minimal Python version sanity check
#-----------------------------------------------------------------------------

import sys

v = sys.version_info
if v[:2] < (2,7) or (v[0] >= 3 and v[:2] < (3,3)):
    error = "ERROR: %s requires Python version 2.7 or 3.3 or above." % name
    print(error, file=sys.stderr)
    sys.exit(1)

#-----------------------------------------------------------------------------
# get on with it
#-----------------------------------------------------------------------------

import os
from distutils.core import setup
from distutils.command.build_py import build_py
from distutils.command.sdist import sdist
from os.path import join as pjoin


pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))

packages = []
for d, _, _ in os.walk(pjoin(here, name)):
    if os.path.exists(pjoin(d, '__init__.py')):
        packages.append(d[len(here)+1:].replace(os.path.sep, '.'))

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)


setup_args = dict(
    name            = name,
    version         = version_ns['__version__'],
    scripts         = [],
    packages        = packages,
    package_data    = {},
    description     = "IPython HTML widgets for Jupyter",
    long_description = LONG_DESCRIPTION,
    author          = 'IPython Development Team',
    author_email    = 'ipython-dev@scipy.org',
    url             = 'http://ipython.org',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Interactive', 'Interpreter', 'Shell', 'Web'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
    ],
    cmdclass        = {
        'build_py': build_py,
        'sdist': sdist,
    },
)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipython>=4.0.0',
    'ipykernel>=4.2.2',
    'traitlets>=4.2.0',
    # TODO: Dynamically add this dependency
    # only if notebook 4.x is installed in this
    # interpreter, to allow ipywidgets to be
    # installed on bare kernels.
    'widgetsnbextension>=1.2.2',
]

extras_require = setuptools_args['extras_require'] = {
    'test:python_version=="2.7"': ['mock'],
    'test': ['nose'],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
