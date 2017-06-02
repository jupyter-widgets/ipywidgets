#!/usr/bin/env bash

# For a clean conda environment, do:

# conda create -c conda-forge -n ipywidgets notebook=4.4.1
# source activate ipywidgets
# pip install jupyterlab==0.16.2
# ipython kernel install --name ipywidgets --display-name "ipywidgets" --sys-prefix
# git clone https://github.com/jupyter-widgets/ipywidgets.git
# cd ipywidgets
# ./dev-install.sh

echo -n "Checking npm... "
npm -v
if [ $? -ne 0 ]; then
    echo "'npm -v' failed, therefore npm is not installed.  In order to perform a
    developer install of ipywidgets you must have both npm and pip installed on your
    machine! See http://blog.npmjs.org/post/85484771375/how-to-install-npm for
    installation instructions."
    exit 1
fi

echo -n "Checking pip... "
pip --version
if [ $? -ne 0 ]; then
    echo "'pip --version' failed, therefore pip is not installed. In order to perform
    a developer install of ipywidgets you must have both pip and npm installed on
    your machine! See https://packaging.python.org/installing/ for installation instructions."
    exit 1
fi

echo -n "Checking jupyter lab... "
jupyter lab --version 2>/dev/null
if [ $? -ne 0 ]; then
    echo "no, skipping installation of jupyterlab_widgets"
    skip_jupyter_lab=yes
fi


# All following commands must run successfully
set -e

nbExtFlags="--sys-prefix $1"

cd jupyter-widgets-controls
npm install
cd ..

cd widgetsnbextension

# Needed since jupyter-widgets-controls 3 hasn't been published yet
npm install ../jupyter-widgets-controls

npm install
npm run update
pip install -v -e .
if [[ "$OSTYPE" == "msys" ]]; then
    jupyter nbextension install --overwrite --py $nbExtFlags widgetsnbextension
else
    jupyter nbextension install --overwrite --py --symlink $nbExtFlags widgetsnbextension
fi
jupyter nbextension enable --py $nbExtFlags widgetsnbextension
cd ..

# Install Python ipywidgets before jLab part
pip install -v -e .

# skip jupyter lab installation until we update the instructions below
skip_jupyter_lab=yes

if test "$skip_jupyter_lab" != yes; then
    cd jupyterlab_widgets

    # needed since jupyter-widgets-controls 3 hasn't been published yet
    npm install ../jupyter-widgets-controls

    npm install
    npm run update
    pip install -v -e .
    if [[ "$OSTYPE" == "msys" ]]; then
        jupyter labextension install --overwrite --py $nbExtFlags jupyterlab_widgets
    else
        jupyter labextension install --overwrite --py --symlink $nbExtFlags jupyterlab_widgets
    fi
    jupyter labextension enable --py $nbExtFlags jupyterlab_widgets
    cd ..
fi
