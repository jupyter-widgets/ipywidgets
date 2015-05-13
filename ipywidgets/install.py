#!/usr/bin/env python

# Thanks @takluyver for your cite2c install.py.
# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

import argparse
from os.path import dirname, abspath, join as pjoin

from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager

def install(user=False, symlink=False, quiet=False, enable=False):
    """Install the widget nbextension and optionally enable it.
    
    Parameters
    ----------
    user: bool
        Install for current user instead of system-wide.
    symlink: bool
        Symlink instead of copy (for development).
    enable: bool
        Enable the extension after installing it.
    quiet: bool
        Suppress print statements about progress.
    """
    if not quiet:
        print("Installing nbextension ...")
    staticdir = pjoin(dirname(abspath(__file__)), 'static')
    install_nbextension(staticdir, destination='widgets', user=user, symlink=symlink)
    
    if enable:
        if not quiet:
            print("Enabling the extension ...")
        cm = ConfigManager()
        cm.update('notebook', {
            "load_extensions": {
                "widgets/notebook/js/extension": True,
            }
        })
    if not quiet:
        print("Done.")

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Installs the IPython widgets")
    parser.add_argument("-u", "--user", help="Install as current user instead of system-wide", action="store_true")
    parser.add_argument("-s", "--symlink", help="Symlink instead of copying files", action="store_true")
    parser.add_argument("-e", "--enable", help="Enable the extension", action="store_true")
    parser.add_argument("-q", "--quiet", help="Suppress output", action="store_true")
    args = parser.parse_args()
    
    install(user=args.user, symlink=args.symlink, enable=args.enable, quiet=args.quiet)