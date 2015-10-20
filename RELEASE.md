To release a new version of the widgets on PyPI:

1. Update \_version.py (set release version, remove 'dev')
2. `git add` and `git commit`
3. `python setup.py sdist upload` 
4. `python setup.py bdist_wheel upload`
5. `git tag -a X.X.X -m 'comment'`
6. Update \_version.py (add 'dev' and increment minor)
7. `git add` and `git commit`
8. `git push`
9. `git push --tags`

On GitHub
1. Go to https://github.com/ipython/ipywidgets/milestones and click "Close" for the released version.
2. Make sure patch, minor, and/or major milestones exist as appropriate.
