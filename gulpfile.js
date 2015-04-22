var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

// spawn-sync polyfill for nodejs < 0.12
var spawn = require('spawn-sync');
// var spawn = require('child_process').spawnSync;


gulp.task('css', function (cb) {
  var p = spawn('python', ['-c',
    "import os,jupyter_notebook; print(os.path.join(jupyter_notebook.DEFAULT_STATIC_FILES_PATH))"]);
  var nb_static_path = p.stdout.toString().trim();
  return gulp.src('./ipython_widgets/static/widgets/css/widgets.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [nb_static_path],
    }))
    .pipe(minifyCSS())
    .pipe(rename({
            dirname: path.join('..', 'css'),
            suffix: '.min'
        }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./ipython_widgets/static/widgets/css/'));
});
