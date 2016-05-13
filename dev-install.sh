#!/usr/bin/env bash
cd jupyter-js-widgets
npm install
cd ..
cd widgetsnbextension
npm install
npm run update
npm run nbextension
cd ..
pip install -v -e .
