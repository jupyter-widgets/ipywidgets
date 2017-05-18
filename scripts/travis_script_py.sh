mkdir /tmp/ipywidgets
cd /tmp/ipywidgets
nosetests --with-coverage --cover-package=ipywidgets ipywidgets

# Verify docs build
pushd docs
pip install -r requirements.txt
make html
popd
