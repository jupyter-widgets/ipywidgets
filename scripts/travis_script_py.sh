set -ex

mkdir /tmp/ipywidgets
cd /tmp/ipywidgets
pytest --cov=ipywidgets ipywidgets
