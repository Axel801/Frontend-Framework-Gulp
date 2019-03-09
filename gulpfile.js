(function () {

    let gulp = require('gulp');
    let autoprefixer = require('gulp-autoprefixer');
    let concat = require('gulp-concat');
    let pug = require('gulp-pug');
    let rename = require('gulp-rename');
    let sass = require('gulp-sass');
    let sourcemaps = require('gulp-sourcemaps');
    let uglify = require('gulp-uglify');
    let watch = require('gulp-watch');
    let file = require('gulp-file');


    //Mueve las fuentes a la carpeta public/fonts
    gulp.task('fonts', fonts);

    function fonts() {
        return gulp.src('dev/fonts/*')
            .pipe(gulp.dest('public/fonts'));
    };


    //Minifica el JS y lo envía a public/js
    gulp.task('min-scripts', min_scripts);

    function min_scripts() {
        return gulp.src('dev/js/scripts.js')
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename('scripts.min.js'))
            .pipe(sourcemaps.write('../../public/js'))
            .pipe(gulp.dest('public/js'));
    }

    //Mueve el scripts.js a public/js
    gulp.task('expanded-scripts', expanded_scripts);

    function expanded_scripts() {
        return gulp.src('dev/js/scripts.js')
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write('../../public/js'))
            .pipe(gulp.dest('public/js'));
    }

    //Crea el fichero styles.min.css en public/css
    function min_css() {
        return gulp.src('dev/sass/styles.scss')
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
            }))
            .pipe(rename('styles.min.css'))
            .pipe(sourcemaps.write('../../public/css'))
            .pipe(gulp.dest('public/css'));
    }

    //Crea el fichero styles.css en public/css
    function expand_css() {
        return gulp.src('dev/sass/styles.scss')
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
            }))
            .pipe(sourcemaps.write('../../public/css'))
            .pipe(gulp.dest('public/css'));
    }

    //Mover los CSS de las distintas librerías
    function move_css() {
        return gulp.src('dev/css/*.css')
            .pipe(gulp.dest('public/css'));
    }

    //Mover los JS de las distintas librerías
    function move_js() {
        return gulp.src(['dev/js/*.js', '!dev/js/scripts.js'])
            .pipe(gulp.dest('public/css'));
    }

    //Mueve las imagenes a public/images
    gulp.task('images', images);

    function images() {
        return gulp.src('dev/images/*')
            .pipe(gulp.dest('public/images'));
    }

    gulp.task('compile_pug', compile_pug);

    function compile_pug() {
        return gulp.src('dev/pug/*.pug')
            .pipe(pug({
                pretty: true
            }))
            .pipe(gulp.dest('public'));
    }


    //Para poder ver todas las tareas que hay creadas, gulp --tasks

    //Para hacer varias tareas a la vez
    //exports.'nombre de la tarea'
    exports.css = gulp.parallel(expand_css, min_css, move_css);
    exports.js = gulp.parallel(expanded_scripts, min_scripts, move_js);

    //Usamos default para solo poner gulp en la consola
    exports.default = gulp.series(exports.css, exports.js, compile_pug, images, fonts, watchAll);

    //Watchers
    //gulp.task('watch', watchAll);
    function watchAll() {
        gulp.watch('dev/js/**/*.js', exports.js);
        gulp.watch('dev/sass/**/*.scss', exports.css);
        gulp.watch('dev/pug/**/*.pug', compile_pug);
        gulp.watch('dev/fonts/**/*.*', fonts);
        gulp.watch('dev/images/**/*.*', images);
    }


    //Al hacer 'gulp init' se crea el framework
    exports.init = gulp.series(init,init_files);
    function init() {
        return gulp.src('*.*', {read: false})
            .pipe(gulp.dest('dev/css'))
            .pipe(gulp.dest('dev/fonts'))
            .pipe(gulp.dest('dev/images'))
            .pipe(gulp.dest('dev/js'))
            .pipe(gulp.dest('dev/pug/components'))
            .pipe(gulp.dest('dev/sass/components'))
    }
    //Creamos los ficheros
    function init_files() {
        let js = file('scripts.js', '')
            .pipe(gulp.dest('dev/js'));
        let css = file('styles.scss', '')
            .pipe(gulp.dest('dev/sass'));
        let css_var = file('_variables.scss', '')
            .pipe(gulp.dest('dev/sass/components'));
        let pug = file('index.pug', '')
            .pipe(gulp.dest('dev/pug'));
        return gulp.src('*.*');
    }
})();
