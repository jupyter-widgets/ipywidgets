# Using ipywidgets in node
## Description
This directory is an example project that shows how you can use the widgets in
node using `jsdom` and `navigator`.  It prints a list of all `ipywidget` 
exported names to the command line.

## Try it
1. Open a command line in this directory and run `npm install`.  
2. In the same command line, run `node index.js`.

## Details
If you plan to reproduce this in your own project, pay careful attention to the 
package.json file.  The dependency to ipywidgets, which reads 
`"ipywidgets": "file:../../.."`, **should not** point to `"file:../../.."`.  
Instead point it to the version you want to use on npm.  

(but really, you should let npm do this for you by running 
`npm install --save ipywidgets`.)
