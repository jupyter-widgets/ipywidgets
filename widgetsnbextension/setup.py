#!/usr/bin/env python

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
)
import os
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))
js_dir = os.path.join(here, 'src')

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(here, 'widgetsnbextension', 'static', 'extension.js')
]

data_files_spec = [(
    'share/jupyter/nbextensions/jupyter-js-widgets', 'widgetsnbextension/static', 'extension.js*'),
    ('etc/jupyter/nbconfig/notebook.d' , '.', 'widgetsnbextension.json')
]

cmdclass = create_cmdclass('jsdeps', data_files_spec=data_files_spec)
cmdclass['jsdeps'] = combine_commands(
    install_npm(js_dir, npm=['yarn'], build_cmd='build'), ensure_targets(jstargets),
)


if __name__ == '__main__':
    setup(cmdclass=cmdclass)
