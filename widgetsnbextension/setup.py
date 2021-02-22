#!/usr/bin/env python

# Copyright (c) IPython Development Team.
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from jupyter_packaging import (
    combine_commands,
    create_cmdclass,
    ensure_targets,
    get_version,
    install_npm,
    skip_if_exists
)
from pathlib import Path
from setuptools import setup

HERE = Path(__file__).parent.resolve()
IS_REPO = (HERE.parent / '.git').exists()
JS_DIR = HERE / 'src'

# Representative files that should exist after a successful build
js_targets = [
    HERE / 'widgetsnbextension' / 'static' / 'extension.js'
]

data_files_spec = [(
    'share/jupyter/nbextensions/jupyter-js-widgets', 'widgetsnbextension/static', 'extension.js*'),
    ('etc/jupyter/nbconfig/notebook.d' , '.', 'widgetsnbextension.json')
]

cmdclass = create_cmdclass('jsdeps', data_files_spec=data_files_spec)
js_command = combine_commands(
    install_npm(JS_DIR, npm=['yarn'], build_cmd='build'),
    ensure_targets(js_targets),
)

if IS_REPO:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(js_targets, js_command)

if __name__ == '__main__':
    setup(cmdclass=cmdclass)
