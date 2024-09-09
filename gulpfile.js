'use strict';

const { src, dest } = require('gulp');
const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const rigger = require('gulp-rigger');
const panini = require('panini');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

const srcPath = 'src/';
const distPath = 'dist/';

const path = {
	build: {
		html: distPath,
		css: distPath + 'css/',
		js: distPath + 'js/',
		img: distPath + 'img/',
		fonts: distPath + 'fonts/',
	},
	src: {
		html: srcPath + '*.html',
		css: srcPath + 'assets/scss/*.scss',
		js: srcPath + 'assets/js/*.js',
		img: srcPath + 'assets/img/**/*.{jpeg,jpg,png,ico,svg,webp}',
		fonts: srcPath + 'assets/fonts/**/*.{woff,woff2}',
	},
	watch: {
		html: srcPath + '**/*.html',
		css: srcPath + 'assets/scss/**/*.scss',
		js: srcPath + 'assets/js/**/*.js',
		img: srcPath + 'assets/img/**/*.{jpeg,jpg,png,ico,svg,webp}',
		fonts: srcPath + 'assets/fonts/**/*.{woff,woff2}',
	},
	clean: './' + distPath,
};

function server() {
	browserSync.init({
		server: {
			baseDir: './' + distPath,
		},
	});
}

function html() {
	return src(path.src.html, { base: srcPath })
		.pipe(plumber())
		.pipe(
			panini({
				root: srcPath,
				layouts: srcPath + 'tpl/layouts/',
				partials: srcPath + 'tpl/partials/',
			})
		)
		.pipe(dest(path.build.html))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function css() {
	return src(path.src.css, { base: srcPath + 'assets/scss' })
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(cssbeautify())
		.pipe(dest(path.build.css))
		.pipe(
			cssnano({
				zindex: false,
				discardComments: {
					removeAll: true,
				},
			})
		)
		.pipe(removeComments())
		.pipe(
			rename({
				suffix: '.min',
				extname: '.css',
			})
		)
		.pipe(dest(path.build.css))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function js() {
	return src(path.src.js, { base: srcPath + 'assets/js/' })
		.pipe(plumber())
		.pipe(rigger())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min',
				extname: '.js',
			})
		)
		.pipe(dest(path.build.js))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function img() {
	return src(path.src.img, { base: srcPath + 'assets/img/' })
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 80, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.on('data', function (file) {
			console.log('Processing file:', file.path);
		})
		.pipe(dest(path.build.img))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function fonts() {
	return src(path.src.fonts, { base: srcPath + 'assets/fonts/' })
		.pipe(dest(path.build.fonts))
		.pipe(
			browserSync.reload({
				stream: true,
			})
		);
}

function clean() {
	return del(path.clean);
}

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, img, fonts));
const watch = gulp.parallel(build, watchFiles, server);

exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
