# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
jupyterlab_widgets setup
"""
from jupyter_packaging import (
    wrap_installers,
    npm_builder,
    get_data_files
)
from pathlib import Path
from setuptools import setup

HERE = Path(__file__).parent.resolve()
IS_REPO = (HERE.parent / '.git').exists()
LAB_PATH = HERE / "jupyterlab_widgets" / "labextension"

# The name of the project
name = "jupyterlab_widgets"
labext_name = "@jupyter-widgets/jupyterlab-manager"

data_files_spec = [
    (f"share/jupyter/labextensions/{labext_name}", LAB_PATH, "**"),
    (f"share/jupyter/labextensions/{labext_name}", HERE, "install.json"),
]

post_develop = npm_builder(
    build_cmd="install:extension", source_dir="src", build_dir=LAB_PATH
)

cmdclass = wrap_installers(post_develop=post_develop)

if __name__ == "__main__":
    setup(
        cmdclass=cmdclass,
        data_files=get_data_files(data_files_spec),
    )
