var gulp = require('gulp');
var coffee = require('gulp-coffee');
var sass = require('gulp-ruby-sass');
gulp.task('js', function(){
  //Javascript
  gulp.src('kleur.coffee')
    .pipe(coffee({bare:true}))
    .pipe(gulp.dest('dist/'));
});
gulp.task('sass', function(){
  gulp.src('kleur.scss')
    .pipe(sass({
      loadPath: require('node-bourbon').includePaths,
      style: 'compressed',
      quiet: true
    }))
    .pipe(gulp.dest('dist/'));
});
gulp.task('watch', function(){
  gulp.watch(['kleur.coffee'], ['js']);
  gulp.watch(['kleur.scss'], ['sass']);
});
gulp.task('default', [
  'js',
]);
