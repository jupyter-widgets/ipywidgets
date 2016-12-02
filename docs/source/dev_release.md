Developer Release Procedure
===========================

To release a new version of the widgets on PyPI and npm, first checkout master
and cd into the repo root.  Make sure the frontend version in
`ipywidgets/_version.py` matches the JS frontend version.

### Publish jupyter-js-widgets

```
# nuke the  `dist` and `node_modules`
git clean -fdx
npm version [patch/minor/major]
npm install
npm publish --tag next
```

### widgetsnbextension

Edit package.json to point to new jupyter-js-widgets version
npm version [patch/minor/major]

Edit `widgetsnbextension/_version.py` (Remove dev from the version.  If it's the first beta, use b1, etc...)

```
python setup.py sdist
python setup.py bdist_wheel --universal
twine upload dist/*
```

### ipywidgets

edit ipywidgets/_version.py (remove dev from the version and update the frontend version requirement to match the one of jupyter-js-widgets)

Change `setup.py` `install_requires` parameter to point to new widgetsnbextension version

```
python setup.py sdist
python setup.py bdist_wheel --universal
twine upload dist/*
```

### JupyterLab

Edit the package.json to have jupyter-js-widgets point to the correct version.

```
npm version patch/minor/major
npm install
npm run build
npm publish
python setup.py sdist
python setup.py bdist_wheel --universal
twine upload dist/*
```

### Push changes back

commit and tag (ipywidgets) release


### Back to dev
```
edit ipywidgets/_version.py (increase version and add dev tag)
edit widgetsnbextension/widgetsnbextension/_version.py (increase version and add dev tag)
git add ipywidgets/_version.py
git add widgetsnbextension/widgetsnbextension/_version.py
git commit -m "Back to dev"
git push [upstream master]
git push [upstream] --tags
```

On GitHub
1. Go to https://github.com/ipython/ipywidgets/milestones and click "Close" for the released version.
2. Make sure patch, minor, and/or major milestones exist as appropriate.
