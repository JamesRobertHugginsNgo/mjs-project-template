const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gulpfile = require('gulp-file');

////////////////////////////////////////////////////////////////////////////////

function cleanup() {
	return del('dist');
}

function buildJs() {
	return gulp.src(['src/**/*.js', 'src/**/*.mjs'], { since: gulp.lastRun(buildJs) })
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(gulp.dest('dist'));
}

exports.default = gulp.series(cleanup, gulp.parallel(buildJs));

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
}
