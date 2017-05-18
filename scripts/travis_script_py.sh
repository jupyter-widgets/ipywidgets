set -ex

mkdir /tmp/ipywidgets
cd /tmp/ipywidgets
nosetests --with-coverage --cover-package=ipywidgets ipywidgets
