#!/usr/bin/env bash
set -e
nbExtFlags="--sys-prefix $1"

npm -v
if [ $? -eq 0 ]; then
    echo npm is installed
else
    echo "'npm -v' failed, therefore npm is not installed.  In order to perform a
    developer install of ipywidgets you must have both npm and pip installed on your
    machine! See http://blog.npmjs.org/post/85484771375/how-to-install-npm for
    installation instructions."
    exit 1
fi

pip --version
if [ $? -eq 0 ]; then
    echo pip is installed
else
    echo "'pip --version' failed, therefore pip is not installed. In order to perform
    a developer install of ipywidgets you must have both pip and npm installed on
    your machine! See https://packaging.python.org/installing/ for installation instructions."
    exit 1
fi

cd jupyter-js-widgets
npm install
cd ..

cd widgetsnbextension
npm install
pip install -v -e .
if [[ "$OSTYPE" == "msys" ]]; then
    jupyter nbextension install --overwrite --py $nbExtFlags widgetsnbextension
else
    jupyter nbextension install --overwrite --py --symlink $nbExtFlags widgetsnbextension
fi
jupyter nbextension enable --py $nbExtFlags widgetsnbextension
cd ..

jupyter lab --version
if [ $? -eq 0 ]; then
    echo jupyter lab is installed
else
    echo "'jupyter lab --version' failed, therefore jupyter lab is not installed. In order to
    perform a developer install of jupyterlab_widgets you must have jupyter lab on
    your machine! Install using 'pip install jupyterlab && jupyter labextension
    install --py --sys-prefix jupyterlab && jupyter labextension
    enable --py --sys-prefix jupyterlab' or follow instructions at https://github.com/jupyterlab/jupyterlab/blob/master/CONTRIBUTING.md#installing-jupyterlab for developer install."
    exit 1
fi
cd jupyterlab_widgets
npm install
pip install -v -e .
if [[ "$OSTYPE" == "msys" ]]; then
    jupyter labextension install --overwrite --py $nbExtFlags jupyterlab_widgets
else
    jupyter labextension install --overwrite --py --symlink $nbExtFlags jupyterlab_widgets
fi
jupyter labextension enable --py $nbExtFlags jupyterlab_widgets
cd ..

pip install -v -e .
