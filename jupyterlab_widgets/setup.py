"""
jupyterlab_widgets setup
"""
import os

from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, ensure_python, get_version,
)
import setuptools

HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name = "jupyterlab_widgets"

# Ensure a valid python version
ensure_python(">=3.6")

# Get our version
version = get_version(os.path.join(name, "_version.py"))

lab_path = os.path.join(HERE, name, "static")

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(HERE, name, "static", "package.json"),
]

package_data_spec = {
    name: [
        "*"
    ]
}

labext_name = "@jupyter-widgets/jupyterlab-manager"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, lab_path, "*.*"),
    ("share/jupyter/lab/schemas/%s" % labext_name, os.path.join(lab_path, 'schemas', labext_name), "*.*"),
]

cmdclass = create_cmdclass(
    "jsdeps",
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec
)

# if the static assets already exist, do not invoke npm so we can make a wheel
# from the sdist package, since the npm build really only works from this
# repo.
jsbuild = []
if all(os.path.exists(f) for f in jstargets):
    jsbuild.append(install_npm(HERE, build_cmd="build", npm=["jlpm"]))
jsbuild.append(ensure_targets(jstargets))

cmdclass["jsdeps"] = combine_commands(*jsbuild)

with open("README.md", "r") as fh:
    long_description = fh.read()

setup_args = dict(
    name=name,
    version=version,
    url="https://github.com/jupyter-widgets/ipywidgets",
    author="Jupyter Development Team",
    description="A JupyterLab extension.",
    long_description= long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
    license="BSD-3-Clause",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab"],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Framework :: Jupyter",
    ],
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
