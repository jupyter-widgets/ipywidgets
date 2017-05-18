set -ex

pip install file://$PWD#egg=ipywidgets[test] coveralls
