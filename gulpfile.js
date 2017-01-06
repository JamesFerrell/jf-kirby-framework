// Gulp config
var gulp            = require('gulp');
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefixer    = require('gulp-autoprefixer');
var pixrem          = require('gulp-pixrem');
var cleanCSS        = require('gulp-clean-css');
var uglify          = require('gulp-uglify');
var rename          = require('gulp-rename');
var beepbeep        = require('beepbeep');
var minifycss       = require('gulp-minify-css');
var concat          = require('gulp-concat');
var plumber         = require('gulp-plumber');
var del             = require('del');
var browserSync     = require('browser-sync');
var reload          = browserSync.reload;

// Define paths for convenience
var proxyUrl        = 'localhost:8888/jf-kirby-framework/';
var scssMainPath    = 'assets/scss/*.scss';
var scssPartialPath = 'assets/scss/**/*.scss';
var jsPath          = 'assets/js/**/*.js';
var jsPatternPath   = 'site/patterns/**/*.js';
var cssBuildPath    = 'assets/build/css';
var jsBuildPath     = 'assets/build/js';
var pixremTarget    = 'main.min.css';


// Error handling
function handleError(err) {
  console.log(err);
  this.emit('end');
  beepbeep();
}


// Flush the build folder and rebuild
gulp.task('clean', function() {
  return del([cssBuildPath, jsBuildPath]);
});


// Process js
gulp.task('scripts', function() {
  return gulp.src([jsPath, jsPatternPath])
  // concat files
  .pipe(concat('main.js')).on('error', handleError)
  // rename
  .pipe(rename({suffix: '.min'}))
  // minify
  .pipe(uglify())
  // set destination
  .pipe(gulp.dest(jsBuildPath));
});


// Process css
gulp.task('styles', function() {
  gulp.src(scssMainPath)

  // initiate sourcemaps
  .pipe(sourcemaps.init({largeFile: true}))
  // compile sass
  .pipe(sass()).on('error', handleError)
  // update sourcemaps
  .pipe(sourcemaps.write({includeContent: false}))
  .pipe(sourcemaps.init({loadMaps: true}))
  // autoprefixer
  .pipe(autoprefixer({
    browsers: ['last 2 versions', '> 2%'],
    cascade: false,
    remove: false,
    supports: false,
    flexbox: 'no-2009'
  }))
  // update sourcemaps
  .pipe(sourcemaps.write({includeContent: false}))
  .pipe(sourcemaps.init({loadMaps: true}))
  // rename the file
  .pipe(rename({suffix: '.min'}))
  // minify css
  .pipe(cleanCSS())
  // update sourcemaps
  .pipe(sourcemaps.write())
  // set destination
  .pipe(gulp.dest(cssBuildPath));
});


// rem fallback
gulp.task('pixrem', function() {
  gulp.src(cssBuildPath + '/' + pixremTarget)
  .pipe(rename({prefix: 'pixrem.'}))
  .pipe(pixrem('20px'))
  .pipe(gulp.dest(cssBuildPath));
});


// Browsersync config
gulp.task('browser-sync', function() {
  browserSync.init([cssBuildPath + '/*.min.css', jsBuildPath + '/*.min.js'], {
    proxy: proxyUrl,
    port: 3000
  });
});


// Reload
gulp.task('bs-reload', function () {
  browserSync.reload();
});


// Watch scss, js and html files
gulp.task('default', ['clean', 'styles', 'scripts', 'pixrem', 'browser-sync'], function() {
  // Watch scss, run the sass and pixrem tasks on change
  gulp.watch([scssMainPath, scssPartialPath, 'site/patterns/**/*.scss'], ['styles', 'pixrem']);
  // Watch js files, run the scripts task on change
  gulp.watch([jsPath, jsPatternPath], ['scripts']);
  // Watch php files, run the bs-reload task on change
  gulp.watch(['site/**/*.php', 'content/**/*.md'], ['bs-reload']).on('error', handleError);
});
