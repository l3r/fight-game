var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');

var Tasks = {};

gulp.task('browserify', function () {
  	var browserified = transform(function(filename) {
    	var b = browserify(filename);
    	return b.bundle();
  	});

  	if (global.env === 'prod') {
	  	return gulp.src(['./src/client/*.js'])
		    .pipe(browserified)
		    .pipe(uglify())
		    .pipe(stripDebug())
		    .pipe(gulp.dest('./public/js/'));
  	}
  	return gulp.src(['./src/client/*.js'])
	    .pipe(browserified)
	    .pipe(gulp.dest('./public/js/'));
});

gulp.task('tests', function () {
	require('../../tests/server/test/config-spec.js');
	require('../../tests/server/test/player-collection-spec.js');
	require('../../tests/server/test/player-spec.js');
	require('../../tests/server/test/session-collection-spec.js');
	require('../../tests/server/test/session-spec.js');
	require('../../tests/server/test/socket-server-spec.js');
});

Tasks.start = function() {
	gulp.start('browserify');
	if (global.env === 'dev') {
		gulp.start('tests');
	}
}

module.exports = Tasks;