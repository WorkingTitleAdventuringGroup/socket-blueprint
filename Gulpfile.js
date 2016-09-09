const gulp = require('gulp');
const rollup = require('rollup-stream');
const babel = require('rollup-plugin-babel');
const notify = require('gulp-notify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');

const SOURCE_FILES = ['./lib/**/*.js', '.babelrc'];

gulp.task('scripts', () => {
    rollup({
        entry: './lib/main.js',
        sourceMap: true,
        format: 'cjs',
        plugins: [
            babel({
                exclude: 'node_modules/**',
            }),
        ],
    })
    .on('error', function (err) {
        notify.onError({
            title: 'Source Build Error',
            message: '<%= error.message %>',
            sound: 'Bottle',
        })(err);

        console.error(err.stack);
        this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
    .pipe(notify({
        onLast: true,
        message: 'Successfully Built',
    }));
});

gulp.task('default', ['scripts']);

gulp.task('watch', ['scripts'], () => {
    gulp.watch(SOURCE_FILES, ['scripts']);
});