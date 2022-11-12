#!/usr/bin/env python

# Copyright (c) IPython Development Team.
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from jupyter_packaging import (
    wrap_installers,
    npm_builder,
    get_data_files
)
from pathlib import Path
from setuptools import setup

HERE = Path(__file__).parent.resolve()
IS_REPO = (HERE.parent / '.git').exists()
JS_DIR = HERE / 'src'

data_files_spec = [(
    'share/jupyter/nbextensions/jupyter-js-widgets', 'widgetsnbextension/static', 'extension.js*'),
    ('etc/jupyter/nbconfig/notebook.d' , '.', 'widgetsnbextension.json')
]

post_develop = npm_builder(
    build_cmd="yarn", source_dir="src", build_dir=JS_DIR
)

cmdclass = wrap_installers(post_develop=post_develop)

if __name__ == '__main__':
    setup(
        cmdclass=cmdclass,
        data_files=get_data_files(data_files_spec),
    )
