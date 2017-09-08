var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var partials = require('express-partials');
var sassMiddleware = require('node-sass-middleware');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(partials());3
app.use(cookieParser('plm2k45ml2104585jnn2'));
app.use(session({
	secret: 'lb294n7b38n03n5ofaoi'
}));
app.use(sassMiddleware({
    src: path.join(__dirname, 'static/scss'),
    dest: path.join(__dirname, 'public/stylesheets'),
    debug: true,
    // outputStyle: 'compressed',
    outputStyle: 'extended',
    prefix:  '/stylesheets'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Helpers dinamicos:
app.use(function(req, res, next) {

  // si no existe lo inicializa
  if (!req.session.redir) {
    req.session.redir = '/';
  }
  // guardar path en session.redir para despues de login
  // if (!req.path.match(/\/login|\/logout|\/user/)) {
  //   req.session.redir = req.path;
  // }

  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

// Routes of applications
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {errors: []});
});

module.exports = app;
