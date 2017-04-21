#!/usr/bin/env python
# coding: utf-8

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

name = 'ipywidgetschema'

import os
import sys
from distutils.core import setup

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)

setup_args = dict(
    name             = name,
    version          = version_ns['__version__'],
    scripts          = [],
    packages         = ['ipywidgetschema'],
    description      = 'json schemas for Jupyter interactive widgets',
    long_description = '',
    author           = 'IPython Development Team',
    author_email     = 'ipython-dev@scipy.org',
    url              = 'http://ipython.org',
    license          = 'BSD',
    platforms        = "Linux, Mac OS X, Windows",
    keywords         = ['Interactive', 'Interpreter', 'Shell', 'Web'],
    classifiers      = [
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
    ],
)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

setuptools_args = {}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
