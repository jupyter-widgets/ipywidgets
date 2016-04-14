Developer Release Procedure
===========================

To release a new version of the widgets on PyPI and npm, first checkout
master and cd into the repo root.  Make sure the version in `widget.py`  matches
the JS frontend version.  Also check that the frontend version specified in
`manager-base.js` (`version`) is correct.

Then run the
following, replacing the square bracketed content with appropriate values:

```bash
# Remove "dev" from the version.
nano ipywidgets/_version.py
python setup.py sdist upload && python setup.py bdist_wheel upload
cd ../jupyter-js-widgets
npm version [patch/minor/major]
npm publish
cd ..
cd widgetsnbextension
# Update package.json to point to the appropriate version of jupyter-js-widgets
nano package.json
npm version [patch/minor/major]
# Remove "dev" from the version.
nano widgetsnbextension/_version.py
python setup.py sdist upload && python setup.py bdist_wheel upload
cd ..
# Increase version to next "dev" version.
nano ipywidgets/_version.py
nano widgetsnbextension/widgetsnbextension/_version.py
git add ipywidgets/_version.py
git commit -m "Back to dev"
git push [upstream master]
git push [upstream] --tags
```

On GitHub
1. Go to https://github.com/ipython/ipywidgets/milestones and click "Close" for the released version.
2. Make sure patch, minor, and/or major milestones exist as appropriate.
