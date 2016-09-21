#!/usr/bin/env python
# coding: utf-8

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

# the name of the package
name = 'jupyterlab_widgets'

DESCRIPTION = 'JupyterLab extension providing HTML widgets'
LONG_DESCRIPTION = """
.. image:: https://img.shields.io/pypi/v/jupyterlab_widgets.svg
   :target: https://pypi.python.org/pypi/jupyterlab_widgets/
   :alt: Version Number

.. image:: https://img.shields.io/pypi/dm/jupyterlab_widgets.svg
   :target: https://pypi.python.org/pypi/jupyterlab_widgets/
   :alt: Number of PyPI downloads

Interactive HTML Widgets
========================

Interactive HTML widgets for JupyterLab notebooks.

Usage
=====

Install the corresponding package for your kernel (i.e. Python users would also
install `ipywidgets`).  Refer to that package's documentation for usage
instructions.
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

PY3 = (sys.version_info[0] >= 3)

#-----------------------------------------------------------------------------
# get on with it
#-----------------------------------------------------------------------------

import os
from distutils import log
from setuptools import setup, Command
from setuptools.command.build_py import build_py
from setuptools.command.sdist import sdist
from glob import glob
from os.path import join as pjoin, isfile
from subprocess import check_call
import json

log.set_verbosity(log.DEBUG)
log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

repo_root = os.path.dirname(os.path.abspath(__file__))
is_repo = os.path.exists(pjoin(repo_root, '.git'))

npm_path = os.pathsep.join([
    pjoin(repo_root, 'node_modules', '.bin'),
    os.environ.get("PATH", os.defpath),
])

def mtime(path):
    """shorthand for mtime"""
    return os.stat(path).st_mtime

def js_prerelease(command, strict=False):
    """decorator for building minified js/css prior to another command"""
    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj('jsdeps')
            if not is_repo and all(os.path.exists(t) for t in jsdeps.targets):
                # sdist, nothing to do
                command.run(self)
                return
            
            try:
                self.distribution.run_command('jsdeps')
            except Exception as e:
                missing = [t for t in jsdeps.targets if not os.path.exists(t)]
                if strict or missing:
                    log.warn("rebuilding js and css failed")
                    if missing:
                        log.error("missing files: %s" % missing)
                    raise e
                else:
                    log.warn("rebuilding js and css failed (not a problem)")
                    log.warn(str(e))
            command.run(self)
            update_package_data(self.distribution)
    return DecoratedCommand


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


class NPM(Command):
    description = "install package,json dependencies using npm"

    user_options = []
    
    node_modules = pjoin(repo_root, 'node_modules')

    targets = [
        pjoin(repo_root, 'jupyterlab_widgets', 'static', 'jupyterlab_widgets.bundle.js')
    ]

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass
        
    def has_npm(self):
        try:
            check_call(['npm', '--version'])
            return True
        except:
            return False

    def should_run_npm_install(self):
        package_json = pjoin(repo_root, 'package.json')
        node_modules_exists = os.path.exists(self.node_modules)
        return self.has_npm()
    
    def run(self):
        has_npm = self.has_npm()
        if not has_npm:
            log.error("`npm` unavailable.  If you're running this command using sudo, make sure `npm` is available to sudo")
            
        env = os.environ.copy()
        env['PATH'] = npm_path
        
        if self.should_run_npm_install():
            log.info("Installing build dependencies with npm.  This may take a while...")
            check_call(['npm', 'install'], cwd=repo_root, stdout=sys.stdout, stderr=sys.stderr)
            os.utime(self.node_modules, None)

        for t in self.targets:
            if not os.path.exists(t):
                msg = "Missing file: %s" % t
                if not has_npm:
                    msg += '\nnpm is required to build a development version of jupyterlab_widgets'
                raise ValueError(msg)
        

        # update package data in case this created new files
        update_package_data(self.distribution)

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, name)

with open(pjoin(here, 'package.json')) as f:
    pkg = json.load(f)

setup_args = dict(
    name            = name,
    version         = pkg['version'],
    scripts         = [],
    packages        = ['jupyterlab_widgets'],
    description     = DESCRIPTION,
    long_description = LONG_DESCRIPTION,
    author          = 'Jupyter Development Team',
    author_email    = 'jupyter@googlegroups.com',
    url             = 'https://github.com/ipython/ipywidgets',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'Interactive', 'Web'],
    classifiers     = [
        'Development Status :: 3 - Alpha',
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
        'build_py': js_prerelease(build_py),
        'sdist': js_prerelease(sdist, strict=True),
        'jsdeps': NPM,
    },
    zip_safe=False,
    include_package_data = True,
)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

if 'setuptools' in sys.modules:
    # setup.py develop should check for submodules
    from setuptools.command.develop import develop
    setup_args['cmdclass']['develop'] = js_prerelease(develop, strict=True)

setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'notebook>=4.2.0',
]

extras_require = setuptools_args['extras_require'] = {
    'test:python_version=="2.7"': ['mock'],
    'test': ['nose'],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
