// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var fs = require('fs');
var files = ['base.js', 'controls.js', 'index.js', 'libembed-amd.js', 'embed-amd-render.js'];
var output = files.map((f)=>{
    return fs.readFileSync('./dist/amd/'+f).toString();
  }).join(';\n\n');
fs.writeFileSync('./dist/embed-amd.js', output)
