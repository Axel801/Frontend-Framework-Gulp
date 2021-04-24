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
    let browserSync = require('browser-sync').create();
    let babel = require('gulp-babel');

    let paths = {
        default: './',
        dev: {
            default: 'dev',
            scss: 'dev/scss/styles.scss',
            jsScript: 'dev/js/scripts.js',
            jsDependencies: 'dev/js/*.js',
            jsNotDefault: '!dev/js/scripts.js',
            fonts: 'dev/fonts/*',
            css: 'dev/css/*.css',
            images: 'dev/images/*',
            pug: 'dev/pug/*.pug',

        },
        dist: {
            default: 'dist',
            css: 'dist/css',
            fonts: 'dist/fonts',
            js: 'dist/js',
            images: 'dist/images'
        }
    }


    //Mueve las fuentes a la carpeta public/fonts
    gulp.task('fonts', fonts);

    function fonts() {
        return gulp.src(paths.dev.fonts)
            .pipe(gulp.dest(paths.dist.fonts))
            .pipe(browserSync.stream());
    };


    //Minifica el JS y lo envía a public/js
    gulp.task('min-scripts', min_scripts);

    function min_scripts() {
        return gulp.src(paths.dev.jsScript)
            // .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            .pipe(uglify())
            .pipe(rename('scripts.min.js'))
            //.pipe(sourcemaps.write(paths.default))
            .pipe(gulp.dest(paths.dist.js))
            .pipe(browserSync.stream());
    }

    //Mueve el scripts.js a public/js
    gulp.task('expanded-scripts', expanded_scripts);

    function expanded_scripts() {
        return gulp.src(paths.dev.jsScript)
            // .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            // .pipe(sourcemaps.write(paths.default))
            .pipe(gulp.dest(paths.dist.js))

    }

    //Crea el fichero styles.min.css en public/css
    function min_css() {
        return gulp.src(paths.dev.scss)
            .pipe(sourcemaps.init())
            .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(rename('styles.min.css'))
            //.pipe(sourcemaps.write(paths.default))
            .pipe(gulp.dest(paths.dist.css))


    }

    //Crea el fichero styles.css en public/css
    function expand_css() {
        return gulp.src(paths.dev.scss)
            .pipe(sourcemaps.init())
            .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
            .pipe(autoprefixer())
            //.pipe(sourcemaps.write(paths.default))
            .pipe(gulp.dest(paths.dist.css))
            .pipe(browserSync.stream());
    }

    //Mover los CSS de las distintas librerías
    function move_css() {
        return gulp.src(paths.dev.css)
            .pipe(gulp.dest(paths.dist.css))
            .pipe(browserSync.stream());
    }

    //Mover los JS de las distintas librerías
    function move_js() {
        return gulp.src([paths.dev.jsDependencies, paths.dev.jsNotDefault])
            .pipe(gulp.dest(paths.dist.js));
    }

    //Mueve las imagenes a public/images
    gulp.task('images', images);

    function images() {
        return gulp.src(paths.dev.images)
            .pipe(gulp.dest(paths.dist.images))
            .pipe(browserSync.stream());
    }

    gulp.task('compile_pug', compile_pug);

    function compile_pug() {
        return gulp.src(paths.dev.pug)
            .pipe(pug({
                pretty: true
            }))
            .pipe(gulp.dest(paths.dist.default))
            .pipe(browserSync.stream());
    }


    //Para poder ver todas las tareas que hay creadas, gulp --tasks

    //Para hacer varias tareas a la vez
    //exports.'nombre de la tarea'
    exports.css = gulp.parallel(expand_css, move_css);
    exports.js = gulp.parallel(expanded_scripts, move_js);



    //Production
    exports.css_prod = gulp.parallel(expand_css, min_css, move_css);
    exports.js_prod = gulp.parallel(expanded_scripts, min_scripts, move_js);

    //Al hacer 'gulp prod' se crea el framework
    exports.prod = gulp.series(exports.css_prod, exports.js_prod);


    //Usamos default para solo poner gulp en la consola
    exports.default = gulp.series(exports.css, exports.js, compile_pug, images, fonts, watchAll);

    //Watchers
    //gulp.task('watch', watchAll);
    function watchAll() {
        //Creamos el browserSync
        //Para que actualice el navegador es necesario tener en el pug la estructura básica HTML
        browserSync.init({
            server: paths.dist.default
        });
        //Primero compilamos todo
        gulp.watch(paths.dev.default + '/js/**/*.js', exports.js);
        gulp.watch(paths.dev.default + '/scss/**/*.scss', exports.css);
        gulp.watch(paths.dev.default + '/pug/**/*.pug', compile_pug);

        //Luego actualizamos el server
        gulp.watch(paths.dist.default+ '**/*.html').on('change',browserSync.reload);
        gulp.watch(paths.dist.default+ '/js/**/*.js').on('change',browserSync.reload);
        gulp.watch(paths.dist.default+ '/css/**/*.css').on('change',browserSync.reload);
        //gulp.watch(paths.dev.default + '/fonts/**/*.*', fonts).on('change', browserSync.reload);
        //gulp.watch(paths.dev.default + '/images/**/*.*', images).on('change', browserSync.reload);
        return;
    }


    //Al hacer 'gulp init' se crea el framework
    exports.init = gulp.series(init, init_files);

    function init() {
        return gulp.src('*.*', { read: false })
            .pipe(gulp.dest(paths.dev.default + '/css'))
            .pipe(gulp.dest(paths.dev.default + '/fonts'))
            .pipe(gulp.dest(paths.dev.default + '/images'))
            .pipe(gulp.dest(paths.dev.default + '/js'))
            .pipe(gulp.dest(paths.dev.default + '/pug/components'))
            .pipe(gulp.dest(paths.dev.default + '/scss/components'))
    }

    //Creamos los ficheros
    function init_files() {
        let js = file('scripts.js', '')
            .pipe(gulp.dest(paths.dev.default + '/js'));
        let css = file('styles.scss', '')
            .pipe(gulp.dest(paths.dev.default + '/scss'));
        let css_var = file('_variables.scss', '')
            .pipe(gulp.dest(paths.dev.default + '/scss/components'));
        let pug = file('index.pug', '')
            .pipe(gulp.dest(paths.dev.default + '/pug'));
        return gulp.src('*.*');
    }
})();
