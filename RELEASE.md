To release a new version of the widgets on PyPI:

1. Update \_version.py
2. `git add` and `git commit`
3. `python setup.py sdist upload` 
4. `python setup.py bdist_wheel upload`
5. `git tag -a vX.X.X -m 'comment'`
6. `git push`
7. `git push --tags`
