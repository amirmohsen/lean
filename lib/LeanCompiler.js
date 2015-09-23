var Path = require("path");
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

var Compiler = {

	compile: function(src, dest, watch) {
		var bundler;

		src = Compiler.normalizeSrc(src);
		dest = Compiler.normalizeDest(dest);

		if(watch) {
			bundler = watchify(browserify(src, { debug: true }).transform(babel));
		}
		else {
			bundler = browserify(src, { debug: true }).transform(babel);
		}

		function rebundle() {
			console.log('-> bundling...');
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
				rebundle();
			});
		}

		rebundle();
	},

	watch: function(src, dest) {
		console.log('-> watching changes...');
		return Compiler.compile(src, dest, true);
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

	run: function(src, dest) {
		Compiler.watch(src, dest);
	},

	runOnce: function(src, dest) {
		Compiler.compile(src, dest, false);
	}
};

module.exports = Compiler;