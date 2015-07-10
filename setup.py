#!/usr/bin/env python
# coding: utf-8

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

# the name of the package
name = 'ipywidgets'

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
from glob import glob
from distutils import log
from os.path import join as pjoin
from distutils.core import setup, Command
from distutils.command.build_py import build_py
from distutils.command.sdist import sdist

repo_root = os.path.dirname(os.path.abspath(__file__))

def css_js_prerelease(command, strict=False):
    """decorator for building minified js/css prior to another command"""
    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj('jsdeps')
            css = self.distribution.get_command_obj('css')
            try:
                self.distribution.run_command('css')
                self.distribution.run_command('jsdeps')
            except Exception as e:
                if strict:
                    log.warn("rebuilding js and css failed")
                    raise e
                else:
                    log.warn("rebuilding js and css failed (not a problem)")
                    log.warn(str(e))
            command.run(self)
    return DecoratedCommand

class NPM(Command):
    description = "install package,json dependencies using npm"

    node_modules = pjoin(repo_root, 'node_modules')

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass
        
    def should_run_npm(self):
        if not which('npm'):
            print("npm unavailable", file=sys.stderr)
            return False
        if not os.path.exists(self.node_modules):
            return True
        return mtime(self.node_modules) < mtime(pjoin(repo_root, 'package.json'))

    def run(self):
        if self.should_run_npm():
            print("installing build dependencies with npm")
            check_call(['npm', 'install'], cwd=repo_root)
            os.utime(self.node_modules, None)

        env = os.environ.copy()
        env['PATH'] = npm_path

        # update package data in case this created new files
        update_package_data(self.distribution)

class CompileCSS(Command):
    """Recompile Widget CSS

    Regenerate the compiled CSS from LESS sources.

    Requires various dev dependencies, such as gulp and lessc.
    """
    description = "Recompile Widget CSS"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        env = os.environ.copy()
        env['PATH'] = npm_path
        try:
            check_call(['gulp','css'], cwd=repo_root, env=env)
        except OSError as e:
            print("Failed to run gulp css: %s" % e, file=sys.stderr)
            print("You can install js dependencies with `npm install`", file=sys.stderr)
            raise
        # update package data in case this created new files
        update_package_data(self.distribution)

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, name)

packages = []
for d, _, _ in os.walk(pjoin(here, name)):
    if os.path.exists(pjoin(d, '__init__.py')):
        packages.append(d[len(here)+1:].replace(os.path.sep, '.'))

package_data = {
    'ipywidgets': ['static/*/*/*.*'],
    'ipywidgets.tests': ['*.js'],
}

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)


setup_args = dict(
    name            = name,
    version         = version_ns['__version__'],
    scripts         = glob(pjoin('scripts', '*')),
    packages        = packages,
    package_data    = package_data,
    description     = "IPython HTML widgets for Jupyter",
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
        'build_py': css_js_prerelease(build_py),
        'sdist': css_js_prerelease(sdist, strict=True),
        'css': CompileCSS,
        'jsdeps': NPM
    },
)

if 'setuptools' in sys.modules:
    # setup.py develop should check for submodules
    from setuptools.command.develop import develop
    setup_args['cmdclass']['develop'] = css_js_prerelease(develop, strict=True)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipython',
    'traitlets',
    'notebook',
]

extras_require = setuptools_args['extras_require'] = {
    'test:python_version=="2.7"': ['mock'],
    'test': ['nose'],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
