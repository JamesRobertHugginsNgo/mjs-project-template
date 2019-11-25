const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const gulpfile = require('gulp-file');
const merge = require('merge-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

////////////////////////////////////////////////////////////////////////////////

function cleanup() {
	return del('dist');
}

function copyDependencies() {
	const streams = [];

	const pkg = require('./package.json');
	if (pkg.dependencies) {
		const modulePath = './node_modules';
		for (const key in pkg.dependencies) {
			const path = `${modulePath}/${key}`;
			const distPath = `${path}/dist`;
			if (fs.existsSync(distPath)) {
				streams.push(gulp.src([`${distPath}/**/*`, `!${distPath}/lib/**/*`]).pipe(gulp.dest(`dist/lib/${key}`)));
			} else {
				streams.push(gulp.src([`${path}/**/*`]).pipe(gulp.dest(`dist/lib/${key}`)));
			}
		}
	}

	return merge(streams);
}

function buildJs() {
	return gulp.src(['src/**/*.js', 'src/**/*.mjs'], { since: gulp.lastRun(buildJs) })
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(gulp.dest('dist'));
}

function bundleMjs() {
	return new Promise((resolve, reject) => {
		webpack(webpackConfig, (err, stats) => {
			if (err) {
				return reject(err);
			}
			if (stats.hasErrors()) {
				return reject(new Error(stats.compilation.errors.join('\n')));
			}
			resolve();
		});
	});
}

function copyDocs() {
	return gulp.src(['src/**/*.htm', 'src/**/*.html', 'src/**/*.css'], { since: gulp.lastRun(copyDocs) })
		.pipe(gulp.dest('dist'));
}

exports.default = gulp.series(cleanup, copyDependencies, buildJs, bundleMjs, copyDocs);

////////////////////////////////////////////////////////////////////////////////

exports.scaffold = function () {
	let app = 'newapp';
	const appArgIndex = process.argv.indexOf('--app');
	if (appArgIndex !== -1 && process.argv[appArgIndex + 1]) {
		app = process.argv[appArgIndex + 1];
	}

	const pkg = require('./package.json');

	pkg.name = app;
	pkg.version = '0.0.0';

	delete pkg.bugs;
	delete pkg.homepage;
	delete pkg.repository;

	return gulp.src([
		'.editorconfig',
		'.eslintignore',
		'.eslintrc.json',
		'.gitignore',
		'gulpfile.js',
		'src/**/*',
		'src/**/.eslintrc.json'
	], { base: '.' })
		.pipe(gulpfile('package.json', JSON.stringify(pkg, null, 2)))
		.pipe(gulpfile('README.md', `# ${app}\n\nDescription`))
		.pipe(gulp.dest(`../${app}`));
};
