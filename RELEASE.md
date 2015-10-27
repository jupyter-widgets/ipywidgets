To release a new version of the widgets on PyPI and npm, first checkout
master can cd into the repo root.  Then run the following, replacing 
the square bracketed content with appropriate values:

```
npm version [patch/minor/major]
npm publish
git push [upstream master]
git push [upstream] --tags
```

On GitHub
1. Go to https://github.com/ipython/ipywidgets/milestones and click "Close" for the released version.
2. Make sure patch, minor, and/or major milestones exist as appropriate.
