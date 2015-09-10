var Path = require("path");
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

var Compiler = {

	compile: function(watch, src, dest) {
		src = Compiler.normalizeSrc(src);
		dest = Compiler.normalizeDest(dest);

		var bundler = watchify(browserify(src, { debug: true }).transform(babel));

		function rebundle() {
			bundler
				.bundle()
				.on('error', function(err) { console.error(err); this.emit('end'); })
				.pipe(source(dest.name))
				.pipe(buffer())
				.pipe(sourcemaps.init({ loadMaps: true }))
				.pipe(sourcemaps.write('./'))
				.pipe(gulp.dest(dest.dir));
		}

		if (watch) {
			bundler.on('update', function() {
				console.log('-> bundling...');
				rebundle();
			});
		}

		rebundle();
	},

	watch: function(src, dest) {
		return Compiler.compile(true, src, dest);
	},

	normalizeSrc: function(src) {
		return Path.normalize(src);
	},

	normalizeDest: function(dest) {
		dest = Path.normalize(dest);
		return {
			name: Path.basename(dest),
			dir: Path.dirname(dest)
		};
	},

	gulp: function(src, dest) {
		gulp.task('build', function() { return Compiler.compile(false, src, dest); });
		gulp.task('watch', function() { return Compiler.watch(src, dest); });
		gulp.task('default', ['watch']);
	}
};

module.exports = Compiler;