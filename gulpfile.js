var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var merge = require('merge2');

// spawn-sync polyfill for nodejs < 0.12
var spawn = require('spawn-sync');
// var spawn = require('child_process').spawnSync;


// Default task set.
gulp.task('default', ['css']);


// Watch for changes.
gulp.task('watch', function() {
    gulp.watch('./ipywidgets/static/**/*.less', ['css']);
    gulp.watch('./ipywidgets/tests/**/*.ts', ['tests']);
});


// Compile less into css.
gulp.task('css', function (cb) {
  var p = spawn('python', ['-c',
    "import os,notebook; print(os.path.join(notebook.DEFAULT_STATIC_FILES_PATH))"]);
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

// Transpile test typescript to javascript.
gulp.task('tests', [], function() {
    var tsResult = gulp.src('./ipywidgets/tests/**/*.ts')
       .pipe(ts({
            declarationFiles: true,
            noExternalResolve: false,
            target: 'ES5',
            module: 'commonjs',
       }));

    return merge([
        tsResult
            .dts
            .pipe(gulp.dest('./bin/tests')),
        tsResult
            .js
            .pipe(gulp.dest('./bin/tests'))]);
});
