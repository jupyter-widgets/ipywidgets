Developer Release Procedure
===========================

To release a new version of the widgets on PyPI and npm, first checkout master
and cd into the repo root.

### Publish the npm modules

```
# clean out all dirty files
git checkout master
git pull origin master
git reset --hard origin/master
git clean -fdx
npm install
npm run publish
```

Lerna will prompt you for version numbers for each of the changed npm packages. Lerna will then change the versions appropriately (including the interdependency versions), commit, tag, and publish the new packages to npm.

### widgetsnbextension

Go into the `widgetsnbextension` directory. Change `widgetsnbextension/_version.py` to reflect the new version number

```
python setup.py sdist
python setup.py bdist_wheel --universal
twine upload dist/*
```

### ipywidgets

Change `ipywidgets/_version.py` to reflect the new version number. Change the `install_requires` parameter in `setup.py` reference the new widgetsnbextension version.

```
python setup.py sdist
python setup.py bdist_wheel --universal
twine upload dist/*
```


### Push changes back

commit and tag (ipywidgets) release
