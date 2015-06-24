
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jsx = require('gulp-jsxtransform');
var del = require('del');
var merge = require('merge-stream');

gulp.task('copy', function() {
    var bundle = gulp.src('./src/js/*.js')
        .pipe(jsx({harmony:true}))
        .pipe(gulp.dest('./build/js'));
    var index = gulp.src('./src/html/index.html')
        .pipe(gulp.dest('./dist'));
    var css = gulp.src('./src/css/**')
        .pipe(gulp.dest('./dist/css'));
    var bootstrap_css = gulp.src('node_modules/bootstrap/dist/css/**')
        .pipe(gulp.dest('./dist/css'));
    return merge(bundle, index, css, bootstrap_css);
});

gulp.task('bundle', ['jsx', 'copy'], function() {
    return gulp.src('./build/js/main.js')
        .pipe(browserify({debug:true}))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('bundle-libs', ['copy'], function() {
    return gulp.src('./build/js/libs.js')
        .pipe(browserify({insertGlobals: true}))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('jsx', function() {
    return gulp.src('./src/jsx/*.js')
        .pipe(jsx({harmony:true}))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('clean', function(cb) {
    del(['./dist', './build'], cb)
});

gulp.task('watch', function() {
    gulp.watch('./src/**', ['bundle']);
});

gulp.task('build', ['bundle-libs', 'bundle']);
