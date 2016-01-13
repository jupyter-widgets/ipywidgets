# Using jupyter-js-widgets in node
## Description
This directory is an example project that shows how you can use the widgets in
node using `jsdom` and `navigator`.  It prints a list of all `jupyter-js-widgets` 
exported names to the command line.

## Try it
1. Open a command line in the `ipywidgets/ipywidgets` subdirectory and run `npm install`.
2. Cd into this directory and run `npm install`.
3. Now open the `index.html` file.

## Details
If you plan to reproduce this in your own project, pay careful attention to the 
package.json file.  The dependency to jupyter-js-widgets, which reads
`"jupyter-js-widgets": "file:../../../ipywidgets"`, **should not** point to `"file:../../../ipywidgets"`.
Instead point it to the version you want to use on npm.

(but really, you should let npm do this for you by running
`npm install --save jupyter-js-widgets`.)
