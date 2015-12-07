// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Check to see if the dev flag is set.
var dev;
process.argv.slice(2).forEach(function(arg) {
    if (arg === "--dev") dev = true;
});

// Parse the version from the package.json file
var version = require("../package.json").version.split('.');
var major = version[0];
var minor = version[1];
var patch = version[2];

// If the dev flag is set, bump the minor version.  This allows people to mix
// and match dev/stable in Python.
if (dev) {
    minor = String(parseInt(minor) + 1);
}

// Generate the version file contents.
var contents =
    "# DO NOT EDIT!  NPM AUTOMATICALLY WRITES THIS FILE!\nversion_info = (" +
    major + ", " +
    minor + ", " +
    patch +
    (dev ? ", 'dev'" : "") +
    ")\n__version__ = '.'.join(map(str, version_info))\n";

// Write the contents to the file.
var fs = require("fs");
fs.writeFile("_version.py", contents, function(err) {
    if(err) {
        console.error("Could not write the Python version file", err);
        process.exit(1);
    } else {
        console.log("Python version " + major + "." + minor + "." + patch + (dev ? "dev" : "") + " written");
    }
});
