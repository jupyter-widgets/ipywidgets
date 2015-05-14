var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

// spawn-sync polyfill for nodejs < 0.12
var spawn = require('spawn-sync');
// var spawn = require('child_process').spawnSync;


// Default task set.
gulp.task('default', ['css']);


// Watch for changes.
gulp.task('watch', function() {
    gulp.watch('./ipywidgets/static/**/*.less', ['css']);
});


// Compile less into css.
gulp.task('css', function (cb) {
  var p = spawn('python', ['-c',
    "import os,jupyter_notebook; print(os.path.join(jupyter_notebook.DEFAULT_STATIC_FILES_PATH))"]);
  var nb_static_path = p.stdout.toString().trim();
  return gulp.src('./ipywidgets/static/widgets/less/widgets.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [nb_static_path],
    }))
    .pipe(minifyCSS({restructuring: false}))
    .pipe(rename({
            dirname: path.join('..', 'css'),
            suffix: '.min'
        }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./ipywidgets/static/widgets/css/'));
});
