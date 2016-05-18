#!/usr/bin/env bash
nbExtFlags=$1

cd jupyter-js-widgets
npm install
cd ..
cd widgetsnbextension
npm install
npm run update
pip install -v -e .
jupyter nbextension install --py --symlink $nbExtFlags widgetsnbextension
jupyter nbextension enable --py $nbExtFlags widgetsnbextension
cd ..
pip install -v -e .
