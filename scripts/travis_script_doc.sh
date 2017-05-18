set -ex

pwd

# Verify docs build
pushd docs
pip install -r requirements.txt
make html
popd
