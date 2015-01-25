var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

function plumber() {
	return $.plumber({
		errorHandler: $.notify.onError('<%= error %>')
	})
}

function fileContents(filePath, file) {
	return file.contents.toString();
}

gulp.task('html', function() {
	var svgs = gulp.src('src/svg/*.svg')
		.pipe(plumber())
		.pipe($.svgmin())
		.pipe($.svgstore({
			inlineSvg: true
		}))

	return gulp.src('src/**/*.jade')
		.pipe(plumber())
		.pipe($.inject(svgs, {
			transform: fileContents
		}))
		.pipe($.jade())
		.pipe(gulp.dest('dist'))
})

gulp.task('css', function() {
	return gulp.src('src/css/main.css')
		.pipe(plumber())
		.pipe($.myth())
		.pipe($.rename('index.css'))
		.pipe($.sourcemaps.init())
			.pipe($.csso())
			.pipe($.rename({
				extname: '.min.css'
			}))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
})

gulp.task('js:style', function() {
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe($.jscs({
			esnext: true
		}))
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'))
})

gulp.task('js:transform', ['js:style'], function() {
	return gulp.src('src/js/**/*.js', {
		base: 'src'
	})
		.pipe(plumber())
		//.pipe($.msx({harmony: true}))
		.pipe($['6to5']())
		.pipe(gulp.dest('build'))
})

gulp.task('js:test', ['js:transform'], function() {
	return gulp.src('build/js/**/*_test.js')
		.pipe(plumber())
		.pipe($.mocha({
			ui: 'exports'
		}))
})

gulp.task('js:bench', ['js:transform'], function() {
	return gulp.src('build/js/**/*_bench.js')
		.pipe(plumber())
		.pipe($.bench())
})

gulp.task('js:build', ['js:transform'], function() {
	return gulp.src('build/js/main.js')
		.pipe(plumber())
		.pipe($.browserify())
		.pipe($.rename('index.js'))
		.pipe(gulp.dest('build'))
		.pipe($.sourcemaps.init())
			.pipe($.uglify())
			.pipe($.rename({
				extname: '.min.js'
			}))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
})

gulp.task('js', ['js:build'])

gulp.task('gz', ['html', 'css', 'js'], function () {
	return gulp.src([
		'dist/*.@(html|css|js)',
	])
		.pipe(plumber())
		.pipe($.zopfli())
		.pipe(gulp.dest('dist'))
})

gulp.task('copy', function() {
	return gulp.src([
		'src/*.*',
		'!src/*.jade'
	], {
			dot: true
		})
		.pipe(gulp.dest('dist'))
})

gulp.task('manifest', ['gz', 'copy'], function() {
	return gulp.src([
		'dist/*',
		'!dist/manifest.txt'
	])
		.pipe(plumber())
		.pipe($.manifest({
			filename: 'manifest.txt',
			hash: true
		}))
		.pipe(gulp.dest('dist'))
})


gulp.task('size', ['manifest'], function() {
	return gulp.src([
		'dist/*.@(js|css|html).gz',
		'dist/manifest.txt'
	])
		.pipe(plumber())
		.pipe($.size())
})

gulp.task('build', ['size'])
gulp.task('default', ['build'])
gulp.task('watch', ['build'], function() {
	gulp.watch('src/**/*.*', ['build'])
})

gulp.task('deploy', ['build'], function() {
	// create a new publisher
	var publisher = $.awspublish.create({
		key: process.env.AWS_KEY,
		secret: process.env.AWS_SECRET,
		bucket: 'coderacer.io'
	})

	// define custom headers
	var headers = {
		'Cache-Control': 'max-age=315360000, no-transform, public',
	}

	return gulp.src('dist/**/*.*')
		.pipe(plumber())
		.pipe($.awspublish.gzip({
			ext: '.gz'
		}))
		.pipe(publisher.publish(headers))
		.pipe(publisher.sync())
		.pipe(publisher.cache())
		.pipe($.awspublish.reporter())
})
