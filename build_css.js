var source = './ipywidgets/static/widgets/less/widgets.less';
var css_destination = './ipywidgets/static/widgets/css/widgets.css';
var min_destination = './ipywidgets/static/widgets/css/widgets.min.css';

var spawn = require('spawn-sync');
var p = spawn('python', ['-c',
  "import os,notebook; print(os.path.join(notebook.DEFAULT_STATIC_FILES_PATH))"]);
spawn('lessc', [
    '--include-path=' + p.stdout.toString().trim(),
    source,
    css_destination
]);
spawn('cleancss', [
    '--source-map',
    '--skip-restructuring ',
    '-o',
    min_destination,
    css_destination]);
  