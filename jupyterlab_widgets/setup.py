# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
jupyterlab_widgets setup
"""
from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, ensure_python, get_version,
    skip_if_exists
)
from pathlib import Path
from setuptools import setup

HERE = Path(__file__).parent.resolve()
IS_REPO = (HERE.parent / '.git').exists()
LAB_PATH = HERE / "jupyterlab_widgets" / "labextension"

# The name of the project
name = "jupyterlab_widgets"
labext_name = "@jupyter-widgets/jupyterlab-manager"

# Representative files that should exist after a successful build
jstargets = [LAB_PATH / "package.json"]

package_data_spec = {name: ["*"]}

data_files_spec = [
    (f"share/jupyter/labextensions/{labext_name}", LAB_PATH, "**"),
    (f"share/jupyter/labextensions/{labext_name}", HERE, "install.json"),
]

cmdclass = create_cmdclass(
    "jsdeps",
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec
)

# if the static assets already exist, do not invoke npm so we can make a wheel
# from the sdist package, since the npm build really only works from this
# repo.
js_command = combine_commands(
    install_npm(HERE, build_cmd="build:prod", npm=["jlpm"]),
    ensure_targets(jstargets),
)

if IS_REPO:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(jstargets, js_command)

if __name__ == "__main__":
    setup(cmdclass=cmdclass)
