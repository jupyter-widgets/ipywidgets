#!/usr/bin/env bash

# For a clean conda environment please read docs/source/dev_install.md

echo -n "Checking yarn... "
yarn -v
if [ $? -ne 0 ]; then
    echo "'yarn -v' failed, therefore yarn is not installed.  In order to perform a
    developer install of ipywidgets you must have both yarn and pip installed on your
    machine! See https://yarnpkg.com/lang/en/docs/install/ for installation instructions."
    exit 1
fi

echo -n "Checking pip... "
pip --version
if [ $? -ne 0 ]; then
    echo "'pip --version' failed, therefore pip is not installed. In order to perform
    a developer install of ipywidgets you must have both pip and yarn installed on
    your machine! See https://packaging.python.org/installing/ for installation instructions."
    exit 1
fi

echo -n "Checking jupyter lab... "
jupyter lab --version 2>/dev/null
if [ $? -ne 0 ]; then
    echo "no, skipping installation of widgets for jupyterlab"
    skip_jupyter_lab=yes
fi


# All following commands must run successfully
set -e

nbExtFlags="--sys-prefix $1"

echo -n "Installing and building all yarn packages"
yarn install
yarn run build

echo -n "widgetsnbextension"
cd widgetsnbextension
pip install -v -e .
if [[ "$OSTYPE" == "msys" ]]; then
    jupyter nbextension install --overwrite --py $nbExtFlags widgetsnbextension
else
    jupyter nbextension install --overwrite --py --symlink $nbExtFlags widgetsnbextension
fi
jupyter nbextension enable --py $nbExtFlags widgetsnbextension
cd ..

echo -n "ipywidgets"
pip install -v -e .

if test "$skip_jupyter_lab" != yes; then
    jupyter labextension install @jupyter-widgets/jupyterlab-manager
fi
